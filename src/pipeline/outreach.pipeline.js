import inquirer from "inquirer";
import { sendEmail } from "../services/brevo.service.js";
import { buildPersonalizedEmail } from "../templates/emailTemplate.js";
import pLimit from "p-limit";
import { logger } from "../utils/logger.js";
import { getSimilarCompanies } from "../services/ocean.service.js";
import { getDecisionMakers } from "../services/prospeo.service.js";
import { getVerifiedEmail } from "../services/eazyreach.service.js";
import { env } from "../config/env.js";

// Concurrency is intentionally limited to avoid API rate limits
// and ensure stable execution across multiple third-party services.
const limit = pLimit(2);

/*
Pipeline Stages:
1. Discover lookalike companies
2. Find decision makers
3. Enrich contacts with verified emails
4. Generate personalized outreach
5. Request user approval
6. Deliver emails
7. Return structured results
*/

export async function runPipeline(seedDomain) {
  logger.info("==================================================");
  logger.info("🚀 OUTREACH PIPELINE STARTED");
  logger.info("==================================================\n");
  logger.info(`Target Domain : ${seedDomain}`);
  logger.info(`Mock Emails   : ${env.mockEmails}\n`);
  logger.info(`🔍 Finding similar companies... \n`);

  // Discover companies that closely resemble the seed company.
  const companies = await getSimilarCompanies(seedDomain);

  // If no companies are found, log a warning and return an empty array
  if (!companies.length) {
    logger.warn("No similar companies found");
    return [];
  }

  // Log the number of similar companies found
  logger.info(
    `\n✓ Found ${companies.length} similar compan${companies.length === 1 ? "y" : "ies"} \n`,
  );

  // Process each company independently and enrich discovered leads.
  const companyLeads = await Promise.all(
    companies.map((company) =>
      // We wrap the entire processing of each company in the concurrency
      limit(async () => {
        // get decision makers for the company using prospeo service
        // Target leadership and decision-making roles because they are
        // more likely to influence adoption and purchasing decisions.
        let decisionMakers = [];
        try {
          decisionMakers = await getDecisionMakers(company.domain);
        } catch (error) {
          logger.error(`Failed processing ${company.domain}`);
          return {
            company,
            decisionMakers: [],
          };
        }

        // If no decision makers are found, log a warning and return an empty array for this company
        const enrichedDecisionMakers = await Promise.all(
          decisionMakers.map(async (person) => {
            // if linkedin url is not available, we can't get the email, so we return the person object with email as null
            if (!person.linkedinUrl) {
              return {
                ...person,
                email: null,
                verification: null,
              };
            }

            // Get verified email for the decision maker using EazyReach service.
            // Enrich lead data with verified email addresses to improve
            // deliverability and reduce outreach bounce rates.
            const emailData = await getVerifiedEmail(person.linkedinUrl);

            return {
              ...person,
              email: emailData?.email ?? null,
              verification: emailData?.verification ?? null,
            };
          }),
        );

        logger.info(`\n🏢 Company: ${company.name ?? company.domain}`);
        logger.info("\n👥 Decision Makers Found");
        logger.info("--------------------------------------------------");

        // Log each decision maker's name, job title, linkedin url and email (if available)
        enrichedDecisionMakers.forEach((person, index) => {
          logger.info(`${index + 1}. ${person.fullName ?? "Unknown"}`);
          logger.info(`   Title    : ${person.jobTitle ?? "N/A"}`);
          logger.info(`   LinkedIn : ${person.linkedinUrl ?? "N/A"}`);
          logger.info(`   Email    : ${person.email ?? "NO EMAIL"}`);
          logger.info("");
        });

        logger.info("==================================================");
        logger.info("              📧 OUTREACH SUMMARY");
        logger.info("==================================================\n");

        // For each decision maker with a verified email, build a personalized email and log the subject. We will ask the user for confirmation before sending emails to avoid accidental sends during testing.
        enrichedDecisionMakers.forEach((person) => {
          if (!person.email) return;
          // If email is available, build a personalized email and log the subject
          const email = buildPersonalizedEmail(person);
          logger.info(person.fullName);
          logger.info(`Subject: ${email.subject}\n`);
        });

        const { proceed } = await inquirer.prompt([
          {
            type: "confirm",
            name: "proceed",
            message: "Do you want to send outreach emails?",
            default: false,
          },
        ]);

        if (!proceed) {
          logger.warn("Email sending cancelled by user.");

          return {
            company,
            decisionMakers: enrichedDecisionMakers,
          };
        }

        logger.info("✔ Send outreach emails? Yes\n");
        logger.info("📨 Sending Emails...");
        logger.info("--------------------------------------------------");

        // Send emails to all decision makers with verified emails and log the result. We will use p-limit to limit concurrency and handle errors gracefully.
        for (const person of enrichedDecisionMakers) {
          if (!person.email) continue;

          const email = buildPersonalizedEmail(person);

          try {
            const result = await sendEmail({
              toEmail: person.email,
              toName: person.fullName,
              subject: email.subject,
              htmlContent: email.htmlContent,
            });

            logger.info(`✓ Email sent to ${person.email}`);
            logger.info("  Message ID:");
            logger.info(`  ${result.messageId}\n`);
          } catch (error) {
            logger.error(
              `Failed to send email to ${person.email}: ${error.message}`,
            );
            // console.log("ERROR OBJECT:");
            // console.dir(error, { depth: null });
            // console.log("MESSAGE:");
            // console.log(error.message);

            // console.log("RESPONSE:");
            // console.log(error.response?.data);
          }
        }
        // Return structured output so results can be exported to JSON,
        // stored in a database
        return {
          company: {
            domain: company.domain,
            name: company.name,
            relevance: company.relevance,
          },
          decisionMakers: enrichedDecisionMakers,
        };
      }),
    ),
  );

  const totalDecisionMakers = companyLeads.reduce(
    (sum, item) => sum + item.decisionMakers.length,
    0,
  );

  logger.info(
    `Pipeline completed. Companies=${companyLeads.length}, DecisionMakers=${totalDecisionMakers}`,
  );

  return companyLeads;
}
