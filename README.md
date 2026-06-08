# Vocallabs Outreach Pipeline

## Overview
This project implements an automated B2B outreach pipeline that discovers similar companies, identifies relevant decision-makers, enriches them with verified work emails, and prepares personalized outreach emails.

The pipeline is designed as a modular Node.js application with clear separation of concerns, centralized logging, retry handling, and extensible service integrations.

---

## Pipeline Flow
Input Domain <br>
↓
<br>Ocean.io → Similar Companies <br>
↓
<br>Prospeo → Decision Makers<br>
↓
<br>EazyReach → Verified Work Emails<br>
↓
<br>Safety Checkpoint (Summary Review)<br>
↓
<br>Brevo → Personalized Outreach Emails<br>
↓
<br>Output Report

---

## Features

### 1. Similar Company Discovery
Uses Ocean.io lookalike search to identify companies similar to the provided seed domain.

Example:

```bash
node index.js openai.com
```

Output:

- microsoft.com
- kriralabs.com
- other lookalike companies

---

### 2. Decision Maker Discovery
Uses Prospeo's Search Person API to discover relevant decision-makers from each company.

Supported seniority filters:

- Founder/Owner
- C-Suite
- Vice President

Returned data includes:

- Full Name
- Job Title
- LinkedIn URL
- Company Name
- Company Domain

---

### 3. Email Enrichment
Uses EazyReach LinkedIn Email Resolution API to convert LinkedIn profiles into verified work emails.

Returned data includes:

- Work Email
- Verification Status
- Source

Example:

Atul Gupta
VP of Engineering
[atul.gupta@microsoft.com](mailto:atul.gupta@microsoft.com)
verified

---

### 4. Safety Checkpoint
Before any outreach email is sent, the pipeline displays a summary of all contacts and generated outreach emails.

This prevents accidental mass outreach and allows manual confirmation before sending.

Example:

OUTREACH SUMMARY

Name: Atul Gupta
Title: VP of Engineering
Email: [atul.gupta@microsoft.com](mailto:atul.gupta@microsoft.com)

Subject:
Quick idea for Microsoft

Proceed? (Y/N)

---

### 5. Personalized Outreach Emails
After confirmation, Brevo Transactional Email API sends personalized outreach emails.

Personalization includes:

- Recipient Name
- Job Title
- Company Name
- Custom Outreach Message

Example:

Subject:
Quick idea for Microsoft

Hi Atul,

I came across your profile while researching Microsoft.

We help teams automate outreach and lead generation workflows.

Would you be open to a short discussion?

Regards,
Raja Khan

---

## Project Structure
src/

├── config/

│   ├── env.js

│   └── httpClient.js

│

├── pipeline/

│   └── outreach.pipeline.js

│

├── services/

│   ├── ocean.service.js

│   ├── prospeo.service.js

│   ├── eazyreach.service.js

│   ├── eazyreach-auth.service.js

│   └── brevo.service.js

│

├── utils/

│   ├── logger.js

│   ├── retry.js

│   └── emailTemplate.js

│

└── index.js

---

## File Responsibilities

### index.js
Application entrypoint.

Responsibilities:

- Reads seed domain from CLI
- Starts outreach pipeline
- Displays final execution result

---

### outreach.pipeline.js
Main pipeline orchestrator.

Responsibilities:

- Similar company discovery
- Decision-maker enrichment
- Email enrichment
- Summary generation
- Email dispatch

---

### ocean.service.js
Handles Ocean.io integration.

Responsibilities:

- Lookalike company search
- Domain extraction
- Retry handling

---

### prospeo.service.js
Handles Prospeo integration.

Responsibilities:

- Decision-maker discovery
- Seniority filtering
- Response normalization

---

### eazyreach.service.js
Handles EazyReach integration.

Responsibilities:

- LinkedIn URL resolution
- Verified email enrichment
- Verification metadata extraction

---

### brevo.service.js
Handles Brevo transactional email delivery.

Responsibilities:

- Email sending
- Sender configuration
- Message tracking

---

### retry.js
Reusable retry utility.

Responsibilities:

- Automatic retries
- API resilience
- Failure handling

---

### logger.js
Centralized Winston logger.

Responsibilities:

- Service logs
- Pipeline logs
- Error logs

---

## Environment Variables
Create a .env file:

```env
OCEAN_API_KEY=

PROSPEO_API_KEY=

EAZYREACH_CLIENT_ID=

EAZYREACH_CLIENT_SECRET=

BREVO_API_KEY=

BREVO_SENDER_EMAIL=

BREVO_SENDER_NAME=

MOCK_EMAILS=true

MOCK_SEND=true
```

---

## Installation
Install dependencies:

```bash
npm install
```

Run pipeline:

```bash
node index.js openai.com
```

---

## Example Output
Starting outreach pipeline...

Found 1 similar company

Found 2 decision makers

Atul Gupta
VP of Engineering

Avi Yoshi
CTO & Solution Sales at Microsoft Israel

Verified Emails Found

[atul.gupta@microsoft.com](mailto:atul.gupta@microsoft.com)

[avi.yoshi@microsoft.com](mailto:avi.yoshi@microsoft.com)

OUTREACH SUMMARY

Proceed? (Y/N)

Emails sent successfully

Pipeline completed

---

## Design Decisions

### Modular Architecture
Each third-party integration is isolated into its own service layer.

Benefits:

- Easier testing
- Easier maintenance
- Better scalability

### Retry Strategy
All external API calls use retry logic to improve reliability against temporary failures.

### Safety Checkpoint
A manual confirmation step is included before sending emails to avoid accidental outreach.

### Mock Mode
Mock email enrichment and mock email sending can be enabled during development to avoid consuming API credits.

---

## Future Improvements

- CRM integration (HubSpot, Salesforce)
- Email tracking analytics
- Multi-step outreach sequences
- Bulk campaign scheduling
- Dashboard UI
- Persistent database storage
