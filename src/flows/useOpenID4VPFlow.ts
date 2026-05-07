import { toast } from "sonner";
import { useCloudSDK } from "@/context/CloudSDKContext";
import { initiateOpenID4VPApi, validateOpenID4VPApi } from "@/api/services/openID4VPService";
import { domExceptionMessage } from "./dcApiUtils";
import type {
  OpenID4VPCredentialData,
  OpenID4VPValidateResponse,
} from "@/api/types/openID4VPService";
import type { ResDetails } from "@/api/types/iso18013Service";

export function useOpenID4VPFlow() {
  const { accessToken } = useCloudSDK();

  return async (): Promise<OpenID4VPValidateResponse> => {
    if (!accessToken) {
      throw new Error("SDK not initialized. Please authenticate first.");
    }

    if (!navigator.credentials?.get) {
      throw new Error(
        "Digital Credentials API is not available. Please enable it in your browser settings."
      );
    }

    //Initiate session on the server
    const { sessionId, payload } = await initiateOpenID4VPApi(accessToken);

    // Invoke the wallet via the browser's Digital Credentials API.
    // Google Wallet uses protocol "openid4vp-v1-unsigned".
    let credential: DigitalCredential | null = null;
    try {
      credential = (await navigator.credentials.get({
        digital: {
          requests: [{ protocol: "openid4vp-v1-unsigned", data: payload }],
        },
      })) as DigitalCredential | null;
    } catch (err) {
      if (err instanceof DOMException) {
        throw new Error(domExceptionMessage(err));
      }
      throw err;
    }

    if (!credential) {
      throw new Error("No credential returned from the wallet.");
    }

    // Validate the wallet's response on the server.
    // credential.data is { response: "<JWE compact serialization>" }
    const responseToken = (credential.data as unknown as OpenID4VPCredentialData).response;

    if (!responseToken) {
      throw new Error("No response token found in wallet credential.");
    }

    const result = await validateOpenID4VPApi(accessToken, {
      sessionId,
      data: responseToken,
    });

    if (result.cancelled) {
      throw new Error("The wallet cancelled the presentation.");
    }

    if (!result.res) {
      throw new Error(
        "Document verification failed. Signatures or trust checks did not pass."
      );
    }

    const details: ResDetails = JSON.parse(result.resDetails);
    const name = [details.identity?.given_name, details.identity?.family_name]
      .filter(Boolean)
      .join(" ");

    toast.success(`Identity verified${name ? `: ${name}` : "."}`);

    return result;
  };
}
