import credenceLogo from "@/assets/CredenceIDLogoHD.png";

export function SDKHeader() {
  return (
    <header className="sdk-header">
      <div className="sdk-header-brand">
        <img
          src={credenceLogo}
          alt="CredenceID"
          className="sdk-logo-img"
        />
      </div>
    </header>
  );
}
