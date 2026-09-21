import { toast } from "sonner";
import { useCloudSDK } from "@/context/CloudSDKContext";
import { getDocRequestApi, verifyDocRequestApi } from "@/api/services/iso18013Service";
import { domExceptionMessage } from "./dcApiUtils";
import type { ResDetails, VerifyDocRequestResponse } from "@/api/types/iso18013Service";

export function useISO18013Flow() {
  const { accessToken } = useCloudSDK();

  return async (): Promise<VerifyDocRequestResponse> => {
    if (!accessToken) {
      throw new Error("SDK not initialized. Please authenticate first.");
    }

    if (!navigator.credentials?.get) {
      throw new Error(
        "Digital Credentials API is not available. Please enable it in your browser settings."
      );
    }

    //Initiate session on the server
    const { sessionId, dcRequest } = await getDocRequestApi(accessToken);

    //Invoke the wallet via the browser's Digital Credentials API.
    let credential: DigitalCredential | null = null;
    try {
      credential = (await navigator.credentials.get({
        digital: {
          requests: [{ protocol: "org-iso-mdoc", data: dcRequest }],
        },
        mediation: "required",
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

    //DC API spec says data is a DOMString but some implementations return an object.
    const responseData =
      typeof credential.data === "string"
        ? credential.data
        : JSON.stringify(credential.data);

    //Verify the wallet's response on the server
    const result = await verifyDocRequestApi(accessToken, {
      sessionId,
      data: responseData,
    });

    //Check cancelled before res
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
