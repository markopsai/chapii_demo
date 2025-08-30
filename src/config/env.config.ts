export const envConfig = {
  vapi: {
    apiUrl: import.meta.env.VITE_VAPI_API_URL ?? "https://api.vapi.ai",
    token: import.meta.env.VITE_VAPI_WEB_TOKEN ?? import.meta.env.VITE_VAPI_API_KEY ?? "vapi-web-token",
    serverApiKey: import.meta.env.VITE_VAPI_SERVER_API_KEY ?? import.meta.env.VITE_VAPI_API_KEY,
  },
};
