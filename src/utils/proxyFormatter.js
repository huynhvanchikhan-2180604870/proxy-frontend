export const formatProxy = (proxyString) => {
  // Validate proxy string format
  if (!proxyString) {
    throw new Error("Proxy string is required");
  }

  const parts = proxyString.split(":");
  if (parts.length !== 4) {
    throw new Error(
      "Invalid proxy format. Expected: domain:port:username:password"
    );
  }

  const [domain, port, username, password] = parts;

  // Return in the format needed for the API: username:password@domain:port
  return `${username}:${password}@${domain}:${port}`;
};
