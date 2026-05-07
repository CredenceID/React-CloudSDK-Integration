import { useCloudSDK } from "@/context/CloudSDKContext";

export function SDKHeader() {
  const { isAuthenticated, isLoading, customerName, profileName } = useCloudSDK();

  return (
    <header className="sdk-header">
      <div className="sdk-header-brand">
        <span className="sdk-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </span>
        <span className="sdk-title">CloudSDK</span>
        <span className={`sdk-status-badge ${isLoading ? "loading" : isAuthenticated ? "ok" : "idle"}`}>
          <span className="sdk-status-dot" aria-hidden="true" />
          {isLoading ? "Connecting…" : isAuthenticated ? "Initialized" : "Not connected"}
        </span>
      </div>

      <div className="sdk-header-info">
        <div className="sdk-info-group">
          <span className="sdk-info-label">License Owner</span>
          <span className="sdk-info-value">{customerName || "—"}</span>
        </div>
        <div className="sdk-info-group">
          <span className="sdk-info-label">Profile</span>
          <span className="sdk-info-value">{profileName || "—"}</span>
        </div>
      </div>
    </header>
  );
}
