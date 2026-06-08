// Shared HTTP client configuration to ensure consistent
// timeout and request behavior across all external services.
import axios from "axios";

export const httpClient = axios.create({
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});