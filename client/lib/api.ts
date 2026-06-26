const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export function getApiBaseUrl() {
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalHost) {
    return `${protocol}//${hostname}:3002`;
  }

  return "";
}
