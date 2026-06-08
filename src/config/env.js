import dotenv from "dotenv";

dotenv.config();

export const env = {
  oceanApiKey: process.env.OCEAN_API_KEY,
  prospeoApiKey: process.env.PROSPEO_API_KEY,
  eazyreachApiKey: process.env.EAZYREACH_API_KEY,
  eazyreachClientId: process.env.EAZYREACH_CLIENT_ID,
  eazyreachClientSecret: process.env.EAZYREACH_CLIENT_SECRET,
  mockEmails: process.env.MOCK_EMAILS,
  brevoApiKey: process.env.BREVO_API_KEY,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL,
  brevoSenderName: process.env.BREVO_SENDER_NAME,
  mockSend: process.env.MOCK_SEND === "true",
};
