import { useEffect, useState } from "react";
import "./App.css";
import { useCloudSDK } from "./context/CloudSDKContext";
import { CLOUDSDK_LICENSE_KEY, CLOUDSDK_PROFILE_ID } from "./utils/api/helper";
import { SDKHeader } from "./components/SDKHeader";
import { FlowButton } from "./components/FlowButton";
import { FlowResult } from "./components/FlowResult";
import type { FlowResultData } from "./components/FlowResult";
import { useISO18013Flow } from "./flows/useISO18013Flow";
import { useOpenID4VPFlow } from "./flows/useOpenID4VPFlow";
import { AnnexBFlowButton } from "./components/AnnexBFlowButton";
import { W3CFlowButton } from "./components/W3CFlowButton";

function ISO18013Icon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 9h4M14 12h4M14 15h2" />
      <path d="M5 19v-1a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

function OpenID4VPIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
      <path d="M9 7h6M9 11h4" />
      <circle cx="17" cy="17" r="3" />
      <path d="m19 19 1.5 1.5" />
    </svg>
  );
}

function SamsungWalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
      <path d="M7 6h.01" />
      <path d="M12 6h.01" />
    </svg>
  );
}

function W3CIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2" />
      <path d="M2 12h20" />
    </svg>
  );
}

function App() {
  const { setup, isAuthenticated } = useCloudSDK();
  const runISO18013Flow = useISO18013Flow();
  const runOpenID4VPFlow = useOpenID4VPFlow();
  const [flowResult, setFlowResult] = useState<FlowResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setup(CLOUDSDK_LICENSE_KEY || "", CLOUDSDK_PROFILE_ID || "");
    }
  }, []);

  function handleResult(data: unknown) {
    setFlowResult(data as FlowResultData);
  }

  return (
    <>
      <SDKHeader />
      <main className="flows-main">
        <h2 className="flows-heading">Verification Flows</h2>
        <div className="flows-grid">
          <FlowButton
            label="ISO 18013-5 mDL"
            icon={<ISO18013Icon />}
            onRun={runISO18013Flow}
            onResult={handleResult}
            disabled={!isAuthenticated}
          />
          <FlowButton
            label="OpenID4VP (Google Wallet)"
            icon={<OpenID4VPIcon />}
            onRun={runOpenID4VPFlow}
            onResult={handleResult}
            disabled={!isAuthenticated}
          />
          <AnnexBFlowButton
            label="Annex B (Samsung Wallet)"
            icon={<SamsungWalletIcon />}
            onResult={handleResult}
            disabled={!isAuthenticated}
          />
          <W3CFlowButton
            label="W3C OpenID4VP"
            icon={<W3CIcon />}
            onResult={handleResult}
            disabled={!isAuthenticated}
          />
        </div>

        {flowResult && (
          <div className="flow-result-section-wrap">
            <div className="flow-result-section-header">
              <h2 className="flows-heading" style={{ margin: 0 }}>Result</h2>
            </div>
            <FlowResult
              data={flowResult}
              onClose={() => setFlowResult(null)}
            />
          </div>
        )}
      </main>
    </>
  );
}

export default App;
