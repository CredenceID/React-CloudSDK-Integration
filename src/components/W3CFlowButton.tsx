import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useCloudSDK } from "@/context/CloudSDKContext";
import { initiateW3CApi, pollW3CResultApi } from "@/api/services/w3cService";
import type { FlowResultData } from "./FlowResult";

interface W3CFlowButtonProps {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onResult?: (data: FlowResultData) => void;
  onStart?: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

type Phase = "idle" | "initiating" | "active";

const MAX_POLL_ATTEMPTS = 120; // 120 × 2 s = 4 min timeout

function Spinner() {
  return (
    <svg
      className="flow-spinner"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function W3CFlowButton({
  label,
  subtitle,
  icon,
  onResult,
  onStart,
  isActive,
  disabled,
}: W3CFlowButtonProps) {
  const { accessToken } = useCloudSDK();
  const [phase, setPhase] = useState<Phase>("idle");
  const [deepLink, setDeepLink] = useState("");

  const cancelRef = useRef(false);
  const attemptsRef = useRef(0);

  useEffect(() => () => { cancelRef.current = true; }, []);

  const handleCancel = () => {
    cancelRef.current = true;
    setPhase("idle");
  };

  const handleStart = async () => {
    if (!accessToken) {
      toast.error("SDK not initialized. Please authenticate first.");
      return;
    }

    onStart?.();
    cancelRef.current = false;
    attemptsRef.current = 0;
    setPhase("initiating");

    try {
      const { sessionId, authorizationRequest, requestUri } =
        await initiateW3CApi(accessToken);
      if (cancelRef.current) return;

      const link =
        `openid4vp://authorize` +
        `?client_id=${encodeURIComponent(authorizationRequest.client_id)}` +
        `&request_uri=${encodeURIComponent(requestUri)}`;

      setDeepLink(link);
      setPhase("active");

      const poll = async () => {
        if (cancelRef.current) return;

        if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
          setPhase("idle");
          toast.error("Verification timed out. No response from wallet.");
          return;
        }
        attemptsRef.current += 1;

        try {
          const result = await pollW3CResultApi(accessToken, sessionId);

          if (cancelRef.current) return;

          if (result === null) {
            setTimeout(poll, 2000);
            return;
          }

          setPhase("idle");

          const vd = result.verificationDetails;
          const adapted: FlowResultData = {
            res: result.success,
            resDetails: JSON.stringify({
              identity: {
                ...(result.claims ?? {}),
                issuer: result.issuer ?? undefined,
                issued: result.issuanceDate ?? undefined,
                expires: result.expirationDate ?? undefined,
                credential_type: result.credentialType?.join(", ") ?? undefined,
              },
              authentication: {
                authenticationResult: result.success ? "SUCCESS" : "FAILED",
                issuerRecognized: vd?.issuerTrusted,
                issuerSignedAuthenticated: vd?.vcSignatureValid,
                deviceSignedAuthenticated: vd?.vpSignatureValid,
                dataIntegrity: vd ? vd.nonceMatches && vd.audienceMatches : undefined,
                issuerAuthValid: vd?.notExpired,
                deviceAuthValid: vd?.credentialTypeMatches,
                issuerSubjectInfo: result.issuer ?? undefined,
                msoValidity: result.issuanceDate && result.expirationDate
                  ? `${result.issuanceDate} – ${result.expirationDate}`
                  : undefined,
              },
            }),
          };

          const claims = result.claims ?? {};
          const name = [claims.given_name, claims.family_name]
            .filter(Boolean)
            .join(" ");

          if (result.success) {
            toast.success(`Credential verified${name ? `: ${name}` : "."}`);
          } else {
            toast.error(result.error ?? "Verification failed.");
          }

          onResult?.(adapted);
        } catch (err) {
          if (!cancelRef.current) {
            setPhase("idle");
            toast.error(err instanceof Error ? err.message : "Polling error.");
          }
        }
      };

      setTimeout(poll, 2000);
    } catch (err) {
      setPhase("idle");
      toast.error(err instanceof Error ? err.message : "Failed to initiate session.");
    }
  };

  const isRunning = phase === "initiating" || phase === "active";

  return (
    <>
      <button
        className={`flow-btn-card${isRunning ? " flow-btn-card--running" : ""}${isActive ? " flow-btn-card--active" : ""}`}
        onClick={handleStart}
        disabled={disabled || isRunning}
      >
        {isActive && !isRunning && (
          <span className="flow-btn-card-dot" aria-hidden="true" />
        )}
        <span className="flow-btn-card-icon">
          {phase === "initiating" ? <Spinner /> : icon}
        </span>
        <span className="flow-btn-card-text">
          <span className="flow-btn-card-title">
            {phase === "initiating" ? "Starting…" : label}
          </span>
          {subtitle && phase === "idle" && (
            <span className="flow-btn-card-subtitle">{subtitle}</span>
          )}
        </span>
      </button>

      {phase === "active" && (
        <div
          className="annexb-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Scan QR code with your W3C wallet"
        >
          <div className="annexb-modal">
            <div className="annexb-modal-header">
              <h3 className="annexb-modal-title">Scan with Your Wallet</h3>
              <button
                className="annexb-cancel-icon"
                onClick={handleCancel}
                aria-label="Cancel"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="annexb-qr-wrap">
              <QRCodeSVG value={deepLink} size={220} marginSize={2} bgColor="transparent" />
            </div>

            <p className="annexb-hint">
              Cross-device: scan this QR code with your OID4VP-compatible wallet
            </p>

            <div className="annexb-divider"><span>or</span></div>

            <a className="annexb-deeplink-btn" href={deepLink}>
              Open in Wallet
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <div className="annexb-polling-row">
              <span className="annexb-polling-dot" />
              <span className="annexb-polling-label">Waiting for wallet response…</span>
            </div>

            <button className="annexb-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
