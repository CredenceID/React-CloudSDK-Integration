/** Maps a DOMException thrown by navigator.credentials.get() to a user-facing message. */
export function domExceptionMessage(err: DOMException): string {
  if (err.name === "NetworkError") {
    return "The DC API request could not be completed. Check your network connection.";
  }
  if (err.name === "AbortError") {
    return "The DC API request timed out. Please try again.";
  }
  if (
    err.name === "NotAllowedError" &&
    err.message.toLowerCase().includes("transient")
  ) {
    return "Digital Credentials API is not available. Enable it in your browser settings.";
  }
  return "The user denied consent or cancelled the wallet prompt.";
}
