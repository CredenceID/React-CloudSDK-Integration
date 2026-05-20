import { useEffect, useState } from "react";
import "./App.css";
import { useCloudSDK } from "./context/CloudSDKContext";
import { CLOUDSDK_LICENSE_KEY } from "./utils/api/helper";
import { SDKHeader } from "./components/SDKHeader";
import { FlowButton } from "./components/FlowButton";
import { FlowResult } from "./components/FlowResult";
import type { FlowResultData } from "./components/FlowResult";
import { useISO18013Flow } from "./flows/useISO18013Flow";
import { useOpenID4VPFlow } from "./flows/useOpenID4VPFlow";
import { AnnexBFlowButton } from "./components/AnnexBFlowButton";
import { W3CFlowButton } from "./components/W3CFlowButton";

const PROFILE_OPTIONS = [
  { label: "Age over 21", profileId: "8c5644fe-7437-402b-bb6b-cc6976817615" },
  { label: "Name check", profileId: "6d94df4f-b3dd-48e8-82ce-684f31cfeec3" },
] as const;

/* ── Brand icons ─────────────────────────────────────────────────────────────── */

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function SamsungIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1428A0" />
      <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">S</text>
    </svg>
  );
}

function QRCodeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M5 5h3v3H5zM16 5h3v3h-3zM5 16h3v3H5z" fill="currentColor" stroke="none" />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM16 16h2v2h-2zM18 18h2v2h-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── App ─────────────────────────────────────────────────────────────────────── */

type FlowId = "iso" | "openid4vp" | "annexb" | "w3c";

function App() {
  const { setup, isAuthenticated, isLoading } = useCloudSDK();
  const runISO18013Flow = useISO18013Flow();
  const runOpenID4VPFlow = useOpenID4VPFlow();
  const [flowResult, setFlowResult] = useState<FlowResultData | null>(null);
  const [selectedProfile, setSelectedProfile] = useState(0);
  const [activeFlow, setActiveFlow] = useState<FlowId | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCopyProfileId() {
    navigator.clipboard.writeText(PROFILE_OPTIONS[selectedProfile].profileId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    setup(CLOUDSDK_LICENSE_KEY || "", PROFILE_OPTIONS[0].profileId);
  }, []);

  function handleProfileChange(idx: number) {
    setSelectedProfile(idx);
    setup(CLOUDSDK_LICENSE_KEY || "", PROFILE_OPTIONS[idx].profileId);
  }

  function handleResult(data: unknown) {
    setFlowResult(data as FlowResultData);
  }

  return (
    <>
      <SDKHeader />
      <div className="app-layout">
        <aside className="app-sidebar">
          <div className="sidebar-brand">
            <h2 className="sidebar-title">Cloud SDK</h2>
            <p className="sidebar-desc">Present &amp; Verify your Digital ID remotely with our Cloud SDK</p>
            <span className={`sdk-status-badge sidebar-status-badge ${isLoading ? "loading" : isAuthenticated ? "ok" : "idle"}`}>
              <span className="sdk-status-dot" aria-hidden="true" />
              {isLoading ? "Connecting…" : isAuthenticated ? "Initialized" : "Not connected"}
            </span>
          </div>

          <div className="sidebar-flows">
            <span className="sidebar-flows-label">Verification Flows</span>
            <div className="sidebar-buttons">
              <FlowButton
                label="Digital Credentials API"
                subtitle="org-iso-mdoc"
                icon={<AppleIcon />}
                onRun={runISO18013Flow}
                onResult={handleResult}
                onStart={() => setActiveFlow("iso")}
                isActive={activeFlow === "iso"}
                disabled={!isAuthenticated}
              />
              <AnnexBFlowButton
                label="OID4VP mdoc (Annex B)"
                subtitle="Redirect based"
                icon={<SamsungIcon />}
                onResult={handleResult}
                onStart={() => setActiveFlow("annexb")}
                isActive={activeFlow === "annexb"}
                disabled={!isAuthenticated}
              />
              <FlowButton
                label="Digital Credentials API - OpenID4VP v1"
                subtitle="DC API based"
                icon={<GoogleIcon />}
                onRun={runOpenID4VPFlow}
                onResult={handleResult}
                onStart={() => setActiveFlow("openid4vp")}
                isActive={activeFlow === "openid4vp"}
                disabled={!isAuthenticated}
              />
              <W3CFlowButton
                label="W3C OpenID4VP"
                subtitle="direct_post response mode"
                icon={<QRCodeIcon />}
                onResult={handleResult}
                onStart={() => setActiveFlow("w3c")}
                isActive={activeFlow === "w3c"}
                disabled={!isAuthenticated}
              />
            </div>
          </div>

          <div className="sidebar-profile">
            <label className="sidebar-profile-label" htmlFor="profile-select">
              Configure Profile ID
            </label>
            <select
              id="profile-select"
              className="sidebar-profile-select"
              value={selectedProfile}
              onChange={(e) => handleProfileChange(Number(e.target.value))}
              disabled={isLoading}
            >
              {PROFILE_OPTIONS.map((opt, i) => (
                <option key={opt.profileId} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="sidebar-profile-id-row">
              <span className="sidebar-profile-id-value">
                {PROFILE_OPTIONS[selectedProfile].profileId}
              </span>
              <button
                className="sidebar-profile-copy-btn"
                onClick={handleCopyProfileId}
                title={copied ? "Copied!" : "Copy profile ID"}
                aria-label={copied ? "Copied!" : "Copy profile ID"}
              >
                {copied ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </aside>

        <main className="app-content">
          {flowResult ? (
            <FlowResult
              data={flowResult}
              onClose={() => setFlowResult(null)}
            />
          ) : (
            <div className="app-content-empty">
              <div className="app-content-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <p className="app-content-empty-title">No result yet</p>
              <p className="app-content-empty-hint">Select a verification flow on the left to get started.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
