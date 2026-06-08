import { httpClient } from "../config/httpClient.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const AUTH_URL =
  "https://api.superflow.run/b2b/createAuthToken/";

let cachedToken = null;

export async function getAuthToken() {
  if (cachedToken) {
    return cachedToken;
  }

  const response = await httpClient.post(AUTH_URL, {
    clientId: env.eazyreachClientId,
    clientSecret: env.eazyreachClientSecret,
  });

  cachedToken = response.data?.authToken ?? null;

  return cachedToken;
}