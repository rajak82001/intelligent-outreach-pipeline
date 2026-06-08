import { httpClient } from "../config/httpClient.js";
import { env } from "../config/env.js";
import { retry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";

const PROSPEO_SEARCH_URL = "https://api.prospeo.io/search-person";

// Normalize Prospeo's API response into a consistent internal
// structure used throughout the outreach pipeline.
function normalizeDecisionMaker(item) {
  const person = item?.person ?? {};
  const company = item?.company ?? {};

  return {
    personId: person.person_id ?? null,
    fullName: person.full_name ?? null,
    firstName: person.first_name ?? null,
    lastName: person.last_name ?? null,
    jobTitle: person.current_job_title ?? null,
    linkedinUrl: person.linkedin_url ?? null,

    companyName: company.name ?? null,
    companyDomain: company.domain ?? null,
  };
}

// Discover leadership contacts within a target company who are
// most likely to influence purchasing and adoption decisions.
export async function getDecisionMakers(domain) {
  if (!domain) {
    throw new Error("Domain is required");
  }

  logger.info(`Searching decision makers for ${domain}`);

  const payload = {
    page: 1,
    filters: {
      company: {
        websites: {
          include: [domain],
        },
      },
      person_seniority: {
        include: ["C-Suite", "Vice President"],
      },
    },
  };

  const config = {
    headers: {
      "X-KEY": env.prospeoApiKey,
      "Content-Type": "application/json",
    },
  };

  try {
    // 2 STEP FOR FINAL IMPLEMENTATION:
    // const response = await retry(() =>
    //   httpClient.post(PROSPEO_SEARCH_URL, payload, config),
    // );

    // Mock response used during development to validate pipeline
    // behavior without consuming Prospeo credits.
    const response = {
      data: {
        results: [
          {
            person: {
              person_id: "aaaa1",
              first_name: "Atul",
              last_name: "Gupta",
              full_name: "Atul Gupta",
              linkedin_url: "https://www.linkedin.com/in/guptaatul",
              current_job_title: "VP of Engineering",
            },
            company: {
              name: "Microsoft",
              domain: "microsoft.com",
            },
          },
          {
            person: {
              person_id: "aaaa5",
              first_name: "Avi",
              last_name: "Yoshi",
              full_name: "Avi Yoshi",
              linkedin_url: "https://www.linkedin.com/in/avi-yoshi",
              current_job_title: "CTO & Solution Sales at Microsoft Israel",
            },
            company: {
              name: "Microsoft",
              domain: "microsoft.com",
            },
          },
        ],
        pagination: {
          current_page: 1,
          per_page: 25,
          total_page: 1,
          total_count: 5,
        },
        free: true,
      },
    };

    const results = response.data?.results ?? [];

    if (!results.length) {
      logger.warn(`No decision makers found for ${domain}`);
      return [];
    }

    const decisionMakers = results
      .map(normalizeDecisionMaker)
      .filter((person) => person.fullName && person.linkedinUrl);

    logger.info(`\n✓ Found ${decisionMakers.length} decision makers for ${domain}\n`);

    decisionMakers.forEach((person) => {
      logger.info(
        `${person.fullName} | ${person.jobTitle} | ${person.linkedinUrl}`,
      );
    });

    return decisionMakers;
  } catch (error) {

    logger.error(
      `Prospeo failed for ${domain}: ${
        error.response?.data?.error || error.message
      }`,
    );

    return [];
  }
}
