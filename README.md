# React Guide For Cloud SDK API Integration

A React + TypeScript + Vite app for identity verification using the CredenceID Cloud SDK Apis. Supports ISO 18013-5 mDL, OpenID4VP (Google Wallet), Annex B (Samsung Wallet), and W3C OpenID4VP flows.

---

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- A **License Key** and **Profile ID** from the [Verify with Credence portal](https://alpha.credenceid.com/resources/developer-documentation/integration-guide)


### Browser requirements

- Chrome 141+ (Android 9+ or desktop)
- Safari 17.4+ on iOS 17.4+ (iPhone 11+)
- Chrome 128–140 requires enabling `chrome://flags/#web-identity-digital-credentials`

---

## Environment setup

Create a `.env` file in the project root:

```env
CLOUDSDK_LICENSE_KEY=CS_your_license_key_here
CLOUDSDK_PROFILE_ID=your-profile-uuid-here

# Optional — defaults to https://credenceid.com/cloudsdkdev
# CLOUDSDK_BASE_URL=https://credenceid.com/cloudsdkdev
```

> The variables do **not** use a `VITE_` prefix. `vite.config.ts` reads and injects them at build time.

---

## Running locally

```bash
npm install
npm run dev        # starts dev server at http://localhost:3000
```

```bash
npm run build      # type-check + production build (output: dist/)
npm run preview    # serve the production build locally
npm run lint       # run ESLint
```

---

## API reference

Full Cloud SDK endpoint reference: [https://alpha.credenceid.com/resources/developer-documentation/sdk-reference](https://alpha.credenceid.com/resources/developer-documentation/sdk-reference)
