import { httpClient } from "../config/httpClient.js";
import { env } from "../config/env.js";
import { retry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";

const OCEAN_SEARCH_URL = "https://api.ocean.io/v3/search/companies";

// Discover lookalike companies using Ocean.io to expand the
// prospect pool beyond the initial seed domain.
export async function getSimilarCompanies(domain) {
  if (!domain) {
    throw new Error("Ocean Service requires a seed domain.");
  }

  logger.info(`Starting Ocean lookalike search for domain: ${domain}`);

  const payload = {
    size: 15,
    companiesFilters: {
      lookalikeDomains: [domain],
    },
  };

  const config = {
    headers: {
      "X-Api-Token": env.oceanApiKey,
    },
  };

  // TO REDUCE CREDIT USAGE, WE'LL SKIP THE ACTUAL API CALL AND RETURN AN EMPTY RESULT SET.
//const response = {
 // data: {
   // companies: [
     // {
      //  company: {
         // domain: "kriralabs.com",
         // name: "Krira Labs"
       // },
      //  relevance: "B"
    //  },
     // {
      //  company: {
       //   domain: "microsoft.com",
       //   name: "Microsoft"
      //  },
      //  relevance: "B"
     // },
      // {
      //   company: {
      //     domain: "cetaceanlabs.com",
      //     name: "Cetacean Labs"
      //   },
      //   relevance: "B"
      // }
 //   ]
//  }
// };

  // FINAL IMPLEMENTATION TASK:1
   const response = await retry(async () => {
     return await httpClient.post(OCEAN_SEARCH_URL, payload, config);
   });

  // logger.info(JSON.stringify(response.data, null, 2));

  const companies = response.data?.companies || [];
  // const similarDomains = companies.map(company => company.domain).filter(Boolean);
  
  const similarCompanies = companies.map((item) => ({
    domain: item.company?.domain,
    name: item.company?.name,
    relevance: item.relevance,
  }));

  logger.info(
    `Ocean search completed. Found ${similarCompanies.length} lookalike companies.`,
  );
  return similarCompanies;
}
