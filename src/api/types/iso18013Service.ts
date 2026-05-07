export type GetDocRequestResponse = {
  sessionId: string;
  dcRequest: {
    deviceRequest: string;  // base64url CBOR — ISO 18013-5 DeviceRequest
    encryptionInfo: string; // base64url CBOR — verifier encryption params
  };
};

export type VerifyDocRequestBody = {
  sessionId: string;
  data: string; // base64url CBOR from credential.data
};

export type VerifyDocRequestResponse = {
  res: boolean;        // true only if every signature, expiry, and trust check passed
  resDetails: string;  // stringified JSON — parse client-side
  cancelled?: boolean; // server sets this when the wallet cancelled the presentation
};

export type DrivingPrivilege = {
  vehicleCategory: string;
  issueDate: string;
  expiryDate: string;
};

export type ResDetails = {
  identity: {
    family_name?: string;
    given_name?: string;
    birth_date?: string;
    portrait?: string;             // base64 JPEG
    signature_usual_mark?: string; // base64 JPEG
    driving_privileges?: DrivingPrivilege[];
    [key: string]: unknown;
  };
  authentication: {
    authenticationResult: string;
    issuerRecognized?: boolean;
    issuerSignedAuthenticated?: boolean;
    deviceSignedAuthenticated?: boolean;
    dataIntegrity?: boolean;
    msoValidity?: string;
    issuerSubjectInfo?: string;
    certValidationError?: string;
    issuerAuthValid?: boolean;
    deviceAuthValid?: boolean;
  };
};
