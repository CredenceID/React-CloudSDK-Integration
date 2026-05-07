// W3C Digital Credentials API — draft spec, not yet in standard TypeScript DOM types.
// https://wicg.github.io/digital-credentials/

interface DigitalCredential extends Credential {
  readonly data: string | Record<string, unknown>;
}

interface DigitalCredentialRequest {
  protocol: string;
  data: unknown;
}

interface DigitalCredentialRequestOptions {
  requests: DigitalCredentialRequest[];
}

// Augment the existing DOM interface so navigator.credentials.get({ digital: ... }) type-checks.
interface CredentialRequestOptions {
  digital?: DigitalCredentialRequestOptions;
}
