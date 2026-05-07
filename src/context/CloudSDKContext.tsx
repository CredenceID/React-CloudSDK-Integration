import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  cloudSDKSetupApi,
  cloudSDKRefreshApi,
} from "@/api/services/cloudSDKService";
import type {
  cloudSDKSetupRequestBody,
  CloudSDKSetupResponse,
  CloudSDKRefreshResponse,
  CloudSDKError,
} from "@/api/types/cloudSDKService";

// ─── Session storage ──────────────────────────────────────────────────────────

const SESSION_KEY = "cloudsdk_session";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** Absolute ms timestamp at which the access token expires. */
  expiresAt: number;
  tokenType: string;
  customerName: string;
  profileName: string;
}

function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeSession(
  tokens: Pick<CloudSDKSetupResponse | CloudSDKRefreshResponse, "accessToken" | "refreshToken" | "expiresIn" | "tokenType">,
  profile: { customerName: string; profileName: string }
): void {
  const session: StoredSession = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    tokenType: tokens.tokenType,
    customerName: profile.customerName,
    profileName: profile.profileName,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

//Context types
interface CloudSDKState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  tokenType: string;
  customerName: string;
  profileName: string;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface CloudSDKContextValue extends CloudSDKState {
  setup: (licenseKey: string, profileId: string) => Promise<void>;
}

const CloudSDKContext = createContext<CloudSDKContextValue | null>(null);

const INITIAL_STATE: CloudSDKState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  tokenType: "Bearer",
  customerName: "",
  profileName: "",
  isLoading: false,
  isAuthenticated: false,
};

//State from session

//Returns remaining seconds until expiry, or null if no valid session.
function getValidSession(): { session: StoredSession; remainingSecs: number } | null {
  const session = readSession();
  if (!session) return null;

  const remainingMs = session.expiresAt - Date.now();
  //Require at least 60 s remaining so we don't restore a nearly-dead token
  if (remainingMs < 60_000) {
    clearSession();
    return null;
  }

  return { session, remainingSecs: Math.floor(remainingMs / 1000) };
}

function initState(): CloudSDKState {
  const valid = getValidSession();
  if (!valid) return INITIAL_STATE;

  const { session, remainingSecs } = valid;
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: remainingSecs,
    tokenType: session.tokenType,
    customerName: session.customerName,
    profileName: session.profileName,
    isLoading: false,
    isAuthenticated: true,
  };
}

export function CloudSDKProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CloudSDKState>(initState);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const scheduleRefresh = useCallback(
    (refreshToken: string, expiresInSecs: number, profile: { customerName: string; profileName: string }) => {
      clearRefreshTimer();
      //Fire 60s before expiry
      const delay = Math.max((expiresInSecs - 60) * 1000, 0);
      refreshTimerRef.current = setTimeout(async () => {
        try {
          const data: CloudSDKRefreshResponse = await cloudSDKRefreshApi(refreshToken);
          writeSession(data, profile);
          setState((prev) => ({
            ...prev,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
            tokenType: data.tokenType,
          }));
          scheduleRefresh(data.refreshToken, data.expiresIn, profile);
        } catch (err) {
          const axiosError = err as AxiosError<CloudSDKError>;
          toast.error(
            axiosError.response?.data?.message ??
              axiosError.message ??
              "Token refresh failed."
          );
          clearSession();
          setState((prev) => ({ ...prev, isAuthenticated: false, accessToken: null }));
        }
      }, delay);
    },
    []
  );

  //On mount:if we restored a valid session, update the refresh timer
  useEffect(() => {
    const valid = getValidSession();
    if (valid) {
      scheduleRefresh(valid.session.refreshToken, valid.remainingSecs, {
        customerName: valid.session.customerName,
        profileName: valid.session.profileName,
      });
    }
    return clearRefreshTimer;
  }, []);

  const setup = useCallback(
    async (licenseKey: string, profileId: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const body: cloudSDKSetupRequestBody = { licenseKey, profileId };
        const data: CloudSDKSetupResponse = await cloudSDKSetupApi(body);
        const profile = { customerName: data.customerName, profileName: data.profileName };
        writeSession(data, profile);
        setState({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          tokenType: data.tokenType,
          customerName: data.customerName,
          profileName: data.profileName,
          isLoading: false,
          isAuthenticated: true,
        });
        scheduleRefresh(data.refreshToken, data.expiresIn, profile);
      } catch (err) {
        const axiosError = err as AxiosError<CloudSDKError>;
        toast.error(
          axiosError.response?.data?.message ??
            axiosError.message ??
            "CloudSDK setup failed."
        );
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [scheduleRefresh]
  );

  return (
    <CloudSDKContext.Provider value={{ ...state, setup }}>
      {children}
    </CloudSDKContext.Provider>
  );
}


export function useCloudSDK(): CloudSDKContextValue {
  const ctx = useContext(CloudSDKContext);
  if (!ctx) {
    throw new Error("useCloudSDK must be used within <CloudSDKProvider>");
  }
  return ctx;
}
