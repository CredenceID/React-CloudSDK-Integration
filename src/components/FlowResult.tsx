import type { ResDetails, DrivingPrivilege } from "@/api/types/iso18013Service";

export interface FlowResultData {
  res: boolean;
  resDetails: string;
}

interface FlowResultProps {
  data: FlowResultData;
  onClose?: () => void;
}

// Fields rendered as images instead of text
const IMAGE_KEYS = new Set(["portrait", "signature_usual_mark"]);
// Fields that have dedicated rendering (excluded from the generic grid)
const SKIP_FROM_GRID = new Set([
  "portrait",
  "signature_usual_mark",
  "driving_privileges",
]);

const AUTH_BOOL_KEYS = [
  "issuerRecognized",
  "issuerSignedAuthenticated",
  "deviceSignedAuthenticated",
  "dataIntegrity",
  "issuerAuthValid",
  "deviceAuthValid",
] as const;

// const AUTH_INFO_KEYS = [
//   "msoValidity",
//   "issuerSubjectInfo",
//   "certValidationError",
// ] as const;

function formatKey(key: string): string {
  return key
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function imgSrc(base64: string): string {
  const mime = base64.startsWith("iVBO") ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${base64}`;
}

function isImageField(key: string, value: unknown): value is string {
  return IMAGE_KEYS.has(key) && typeof value === "string" && value.length > 100;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function FlowResult({ data, onClose }: FlowResultProps) {
  let parsed: ResDetails | null = null;
  try {
    parsed = JSON.parse(data.resDetails) as ResDetails;
  } catch {

  }

  const identity = parsed?.identity ?? {};
  const auth = parsed?.authentication ?? {
    authenticationResult: data.res ? "SUCCESS" : "FAILED",
  };
  const authStatus =
    auth.authenticationResult ?? (data.res ? "SUCCESS" : "FAILED");
  const isSuccess = authStatus === "SUCCESS" || data.res;

  const portrait = isImageField("portrait", identity.portrait)
    ? identity.portrait
    : null;
  const signature = isImageField(
    "signature_usual_mark",
    identity.signature_usual_mark,
  )
    ? identity.signature_usual_mark
    : null;
  const drivingPrivileges = Array.isArray(identity.driving_privileges)
    ? (identity.driving_privileges as DrivingPrivilege[])
    : null;

  const identityEntries = Object.entries(identity).filter(
    ([key]) => !SKIP_FROM_GRID.has(key),
  );

  const certErrors = auth.certValidationError;
  const certDisplay =
    !certErrors || certErrors === "[]" || certErrors === "null"
      ? "None"
      : certErrors;

  return (
    <section className="flow-result" aria-label="Verification result">
      {/* ── Header ── */}
      <div className="flow-result-header">
        <div
          className={`flow-result-status ${isSuccess ? "fr-success" : "fr-failure"}`}
        >
          {isSuccess ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          <span>
            {isSuccess ? "Verification Successful" : "Verification Failed"}
          </span>
        </div>
        {onClose && (
          <button
            className="flow-result-close"
            onClick={onClose}
            aria-label="Dismiss result"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flow-result-body">
        {/* Identity */}
        <div className="flow-result-section">
          <h3 className="flow-result-section-title">Identity</h3>

          {portrait && (
            <div className="flow-result-portrait">
              <img src={imgSrc(portrait)} alt="Portrait" />
            </div>
          )}

          <dl className="flow-result-fields">
            {identityEntries.map(([key, value]) => (
              <div key={key} className="flow-result-field">
                <dt>{formatKey(key)}</dt>
                <dd>{formatValue(value)}</dd>
              </div>
            ))}
          </dl>

          {drivingPrivileges && drivingPrivileges.length > 0 && (
            <div className="flow-result-driving">
              <span className="flow-result-sublabel">Driving Privileges</span>
              <div className="flow-result-driving-list">
                {drivingPrivileges.map((p, i) => (
                  <span
                    key={i}
                    className="flow-result-driving-badge"
                    title={`${p.issueDate} – ${p.expiryDate}`}
                  >
                    {p.vehicleCategory}
                  </span>
                ))}
              </div>
            </div>
          )}

          {signature && (
            <div className="flow-result-signature">
              <span className="flow-result-sublabel">Signature</span>
              <img src={imgSrc(signature)} alt="Signature" />
            </div>
          )}
        </div>

        {/* Authentication */}
        <div className="flow-result-section">
          <h3 className="flow-result-section-title">Authentication</h3>

          <div
            className={`flow-result-auth-badge ${isSuccess ? "fr-success" : "fr-failure"}`}
          >
            {authStatus}
          </div>

          <div className="flow-result-checks">
            {AUTH_BOOL_KEYS.map((key) => {
              const value = auth[key as keyof typeof auth];
              if (value === undefined || value === null) return null;
              const passed = Boolean(value);
              return (
                <div
                  key={key}
                  className={`flow-result-check ${passed ? "fr-pass" : "fr-fail"}`}
                >
                  <span className="fr-check-icon" aria-hidden="true">
                    {passed ? "✓" : "✗"}
                  </span>
                  <span>{formatKey(key)}</span>
                </div>
              );
            })}
          </div>

          <dl className="flow-result-fields flow-result-auth-info">
            <div className="flow-result-field">
              <dt>MSO Validity</dt>
              <dd>{auth.msoValidity ?? "—"}</dd>
            </div>
            <div className="flow-result-field">
              <dt>Issuer</dt>
              <dd>{auth.issuerSubjectInfo ?? "—"}</dd>
            </div>
            <div className="flow-result-field">
              <dt>Cert Errors</dt>
              <dd>{certDisplay}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
