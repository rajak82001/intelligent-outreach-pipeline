import { env } from "../config/env.js";
import { httpClient } from "../config/httpClient.js";
import { logger } from "../utils/logger.js";

const BREVO_URL =
  "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
}) {
  if (env.mockSend) {
    logger.info(
      `[MOCK EMAIL] ${toEmail} | ${subject}`
    );

    return {
      messageId: `mock-${Date.now()}`,
    };
  }

  const response = await httpClient.post(
    BREVO_URL,
    {
      sender: {
        email: env.brevoSenderEmail,
        name: env.brevoSenderName,
      },

      to: [
        {
          email: toEmail,
          name: toName,
        },
      ],

      subject,
      htmlContent,
    },
    {
      headers: {
        "api-key": env.brevoApiKey,
        accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}