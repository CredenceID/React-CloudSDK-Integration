export type cloudSDKSetupRequestBody = {
  licenseKey: string;
  profileId: string;
};

export type CloudSDKSetupResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  customerName: string;
  profileName: string;
};

export type CloudSDKRefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
};

export type CloudSDKError = {
  error: string;
  message: string;
};
