import { httpClient } from "../config/httpClient.js";
import { retry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import { getAuthToken } from "./eazyreach-auth.service.js";

const EAZYREACH_URL = "https://api.superflow.run/b2b/linkedin-emails";

export async function getVerifiedEmail(linkedinUrl) {
  if (!linkedinUrl) {
    return null;
  }

  try {
    //Mock response for testing without hitting EazyReach API due to Credit Concerns
    if (env.mockEmails) {
      const mockEmails = {
        "https://www.linkedin.com/in/guptaatul": {
          email: "rajak23242526@gmail.com",
        //   email: "atul.gupta@microsoft.com",
          verification: "verified",
          source: "mock",
        },

        "https://www.linkedin.com/in/avi-yoshi": {
          email: "avi.yoshi@microsoft.com",
          verification: "verified",
          source: "mock",
        },
      };

      return (
        mockEmails[linkedinUrl] || {
          email: "test@company.com",
          verification: "verified",
          source: "mock",
        }
      );
    }

    logger.info(`Resolving email for ${linkedinUrl}`);

    const authToken = await getAuthToken();

    const response = await retry(() =>
      httpClient.post(
        EAZYREACH_URL,
        {
          linkedinUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const emails = response.data?.emails ?? [];

    if (!emails.length) {
      logger.warn(`No email found for ${linkedinUrl}`);
      return null;
    }

    const verifiedEmail =
      emails.find((email) => email.verification === "verified") ?? emails[0];

    return {
      email: verifiedEmail.email,
      verification: verifiedEmail.verification,
      source: verifiedEmail.source,
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message;

    if (message.includes("Zero Balance")) {
      logger.warn(
        "EazyReach account has no credits. Email enrichment skipped.",
      );

      return null;
    }

    logger.error(`EazyReach failed: ${message}`);

    return null;
  }
}
