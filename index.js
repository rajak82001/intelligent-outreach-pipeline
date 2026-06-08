import fs from "fs/promises";
import { runPipeline } from "./src/pipeline/outreach.pipeline.js";
import { logger } from "./src/utils/logger.js";

const [seedDomain] = process.argv.slice(2);

if (!seedDomain) {
  logger.error("Usage: node index.js <seed-domain>");
  process.exit(1);
}

try {
  const companyLeads = await runPipeline(seedDomain);

  // Persist pipeline results so they can be reused for
  // reporting, CRM integration or future processing.
  await fs.writeFile("./output.json", JSON.stringify(companyLeads, null, 2));

  logger.info("==================================================");
  logger.info("✅ PIPELINE COMPLETED");
  logger.info("==================================================\n");
  logger.info(`Companies Processed      : ${companyLeads.length}`);
  
  const totalDecisionMakers = companyLeads.reduce(
    (sum, item) => sum + item.decisionMakers.length,
    0,
  );

  logger.info(`Decision Makers Found    : ${totalDecisionMakers}`);
  logger.info("Output File Generated    : output.json\n");

  companyLeads.forEach((item) => {
    logger.info(`${item.company.name} → ${item.decisionMakers.length} Leads`);
  });
} catch (error) {
  logger.error(`Pipeline failed: ${error.message}`);
  process.exit(1);
}
