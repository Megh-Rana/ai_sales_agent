# AI Sales Agent Platform — Test Cases
**Product:** AI Sales Intelligence & Voice Agent Platform (Futurrizon Technologies Pvt. Ltd.)
**Purpose:** Functional test cases covering AI Lead Discovery, Lead Enrichment, Market Intelligence, Lead Management, AI Voice Agent, CRM Integration, Admin, and User Journey modules.

---

## TC-01: AI Lead Discovery — Discover & Enrich Prospects from Public Sources

| Field | Details |
|---|---|
| **Test Case ID** | TC-01 |
| **Module** | AI Lead Discovery |
| **Objective** | Verify the platform discovers posted requirements from public sources (LinkedIn, X, company websites, public directories, CRM, freelance platforms) and auto-enriches each lead with required fields. |
| **Preconditions** | 1. Client account is registered and onboarded with company website, business details, and product/service info.<br>2. Client has an active subscription (Starter/Growth/Enterprise) with Lead Generation enabled.<br>3. At least one public requirement post exists matching the client's product/service category (e.g., a LinkedIn post: "Looking for a SharePoint Implementation Partner"). |
| **Test Steps** | 1. Log in to the platform (web or mobile).<br>2. Navigate to "Lead Discovery" module.<br>3. Set target industry = "IT Services", location = "Global", keyword = "SharePoint Implementation".<br>4. Trigger a discovery scan (manual or scheduled).<br>5. Wait for the AI to process and return results.<br>6. Open a discovered lead record. |
| **Test Data** | Keyword: "SharePoint Implementation Partner"; Source: LinkedIn; Industry: IT Services |
| **Expected Result** | 1. System returns matching requirement posts from at least one of: LinkedIn, X, company websites, public directories, CRM, freelance platforms.<br>2. Each lead record contains: Name, Business Email (if public), Phone Number (if available), LinkedIn Profile, Company Name & Website, Job Title, Industry, Company Size, Original Requirement Post URL, Source Platform, and Discovery Date.<br>3. The original post URL is clickable and opens the exact source post.<br>4. Leads with no public contact info still display Source Platform + Post URL so the client can reach out manually. |
| **Priority** | High |
| **Pass/Fail Criteria** | Fail if any mandatory enrichment field is missing without explanation, or if the source URL is broken/incorrect. |

---

## TC-02: Lead Search, Filter, Prioritization, Segmentation & Export

| Field | Details |
|---|---|
| **Test Case ID** | TC-02 |
| **Module** | AI Lead Discovery / Lead Management |
| **Objective** | Verify leads can be searched, filtered, segmented, prioritized, and exported to CSV/Excel. |
| **Preconditions** | At least 20 discovered leads exist across 3+ industries and 2+ source platforms. |
| **Test Steps** | 1. Go to the Leads dashboard.<br>2. Apply filters: Industry = "Healthcare", Company Size = "50-200", Source = "LinkedIn".<br>3. Sort/prioritize leads by discovery date or lead score.<br>4. Create a segment named "Q4 Healthcare Prospects" from filtered results.<br>5. Select all filtered leads and export to CSV.<br>6. Repeat export as Excel (.xlsx). |
| **Test Data** | Filter combination: Industry=Healthcare, Size=50-200, Source=LinkedIn |
| **Expected Result** | 1. Filtered results show only leads matching all criteria (AND logic).<br>2. Segment is saved and retrievable later under "Segments".<br>3. Exported CSV/Excel file contains all enrichment fields (Name, Email, Phone, LinkedIn, Company, Website, Job Title, Industry, Company Size, Post URL, Source, Discovery Date) with correct row count matching the filtered set.<br>4. No data corruption or column misalignment in the exported file. |
| **Priority** | High |
| **Pass/Fail Criteria** | Fail if exported row count doesn't match filtered count, or any column is mislabeled/empty when data exists. |

---

## TC-03: Duplicate Detection & CSV/CRM Lead Upload Validation

| Field | Details |
|---|---|
| **Test Case ID** | TC-03 |
| **Module** | Lead Management |
| **Objective** | Verify the system validates uploaded lead data, detects duplicates, and correctly imports from CSV/Excel or a connected CRM. |
| **Preconditions** | Client has a CSV file with 50 leads, 5 of which are exact/near duplicates of existing database leads (same email or phone). |
| **Test Steps** | 1. Navigate to "Upload Leads".<br>2. Upload the prepared CSV file.<br>3. Trigger validation.<br>4. Review the duplicate-detection report.<br>5. Choose to merge/skip duplicates.<br>6. Confirm import.<br>7. Repeat using a CRM import connector (e.g., Salesforce/HubSpot) instead of CSV. |
| **Test Data** | CSV with 50 rows (45 unique, 5 duplicates by email/phone match) |
| **Expected Result** | 1. System flags malformed rows (missing required fields, invalid email format) before import.<br>2. Duplicate leads are identified and presented for merge/skip decision — not silently double-imported.<br>3. Final database shows exactly 45 new unique leads + previously existing 5 (no duplication).<br>4. CRM import produces the same validation/dedup behavior as CSV import. |
| **Priority** | High |
| **Pass/Fail Criteria** | Fail if any duplicate is imported as a new record, or if valid rows are incorrectly rejected. |

---

## TC-04: AI Voice Agent — Outbound Multilingual Call with Qualification & FAQ Handling

| Field | Details |
|---|---|
| **Test Case ID** | TC-04 |
| **Module** | AI Voice Agent |
| **Objective** | Verify the AI Voice Agent places outbound calls, conducts a multilingual conversation, qualifies the prospect, answers FAQs, and generates a transcript/summary/next-best action. |
| **Preconditions** | 1. Client has configured product/service info for AI selling and it has passed system validation.<br>2. Client has selected either the platform's built-in calling service or their own calling infrastructure.<br>3. A qualified lead list (or uploaded list) is ready for campaign launch, including at least one contact with a non-English preferred language. |
| **Test Steps** | 1. Create a new AI Voice campaign and attach the lead segment.<br>2. Set call script/FAQ knowledge base for the product.<br>3. Schedule the campaign per prospect time zone, then launch.<br>4. Simulate/observe an outbound call to a prospect in a non-English-speaking region.<br>5. During the call, have the "prospect" ask a product FAQ and then decline to answer at first (to trigger callback scheduling).<br>6. Let one call go unanswered to test retry + voicemail logic.<br>7. After calls complete, open the call log. |
| **Test Data** | Campaign: "Q4 Outreach – LATAM"; Language: Spanish; Scenario: 1 answered call, 1 unanswered call |
| **Expected Result** | 1. Call is placed at the correct scheduled local time.<br>2. AI conducts the conversation in the prospect's language.<br>3. AI correctly answers the FAQ from the configured knowledge base.<br>4. If the prospect requests a callback, it is scheduled and only continues retries until the call is answered (not after).<br>5. Unanswered call triggers voicemail drop and is queued for retry per policy.<br>6. A transcript, call summary, and next-best-action recommendation are generated and stored against the lead record.<br>7. Once the prospect responds/engages, the system flags the lead as "Interested" and hands off further communication to the client (no further AI-initiated contact). |
| **Priority** | Critical |
| **Pass/Fail Criteria** | Fail if transcript/summary is missing, wrong language is used, callback continues after the call is answered, or handoff to client doesn't occur after prospect response. |

---

## TC-05: Product/Service Validation for AI Selling (Auto + Admin Fallback)

| Field | Details |
|---|---|
| **Test Case ID** | TC-05 |
| **Module** | AI Voice Agent / Admin |
| **Objective** | Verify the system validates a client's product/service for AI-selling suitability, and routes inconclusive cases to an administrator for manual approval. |
| **Preconditions** | Client has completed onboarding and reached the "AI Calling setup" step. |
| **Test Steps** | 1. Submit Product A: a clearly compliant, well-documented SaaS product/service description.<br>2. Submit Product B: an ambiguous/incomplete or borderline description (e.g., missing pricing/compliance details, or a regulated category).<br>3. Observe system behavior for each.<br>4. As Admin, log in to the Admin dashboard and locate the pending approval for Product B.<br>5. Approve or reject Product B from the admin panel. |
| **Test Data** | Product A: "Cloud-based project management software"; Product B: "Financial investment advisory services" (ambiguous/regulated) |
| **Expected Result** | 1. Product A is auto-validated and the client can proceed directly to campaign setup.<br>2. Product B is flagged as inconclusive and a request is routed to the Admin queue — the client cannot launch AI calling for it until resolved.<br>3. Admin sees full product context in the dashboard and can approve/reject with a reason.<br>4. Client is notified of the admin's decision and, if approved, can proceed; if rejected, is blocked from AI calling for that product. |
| **Priority** | High |
| **Pass/Fail Criteria** | Fail if an ambiguous product is auto-approved without admin review, or if the admin queue doesn't surface the pending item. |

---

## TC-06: Market Intelligence — Funding, Hiring, Tech Stack & Competitor Insights

| Field | Details |
|---|---|
| **Test Case ID** | TC-06 |
| **Module** | Market Intelligence |
| **Objective** | Verify the platform surfaces market intelligence data (funding, hiring trends, technology stack, competitor insights) for a given company/lead. |
| **Preconditions** | A discovered lead's associated company has publicly available funding/hiring/tech-stack data. |
| **Test Steps** | 1. Open a lead record's associated Company Profile.<br>2. Navigate to the "Market Intelligence" tab.<br>3. Review the displayed funding history, recent hiring activity, technology stack, and competitor insights. |
| **Test Data** | Company with known recent funding round and active job postings |
| **Expected Result** | 1. Funding data (round, amount if public, date) is displayed correctly and matches public sources.<br>2. Hiring activity (open roles, growth trend) is shown.<br>3. Technology stack is listed with reasonable accuracy.<br>4. Competitor insights list at least one relevant competitor with a brief comparison point.<br>5. All data points are dated/timestamped to indicate freshness. |
| **Priority** | Medium |
| **Pass/Fail Criteria** | Fail if data is stale (no timestamp), fabricated, or a section is blank without a "no data available" message. |

---

## TC-07: CRM Integration — Bi-directional Sync of Leads and Call Outcomes

| Field | Details |
|---|---|
| **Test Case ID** | TC-07 |
| **Module** | CRM Integration |
| **Objective** | Verify leads discovered/enriched on the platform sync correctly to a connected CRM, and call outcomes sync back. |
| **Preconditions** | Client has connected a supported CRM (e.g., Salesforce/HubSpot) via API integration. |
| **Test Steps** | 1. Discover and enrich a new lead on the platform.<br>2. Confirm the lead auto-syncs (or is manually pushed) to the connected CRM.<br>3. In the CRM, verify all enrichment fields mapped correctly.<br>4. Run an AI Voice call against that lead and mark the outcome as "Interested."<br>5. Check that the call outcome, transcript link, and status update sync back to the CRM record. |
| **Test Data** | 1 new lead; CRM: HubSpot (sandbox) |
| **Expected Result** | 1. Lead appears in CRM within the expected sync window with no data loss/mismatch.<br>2. Field mapping is accurate (no truncation, wrong field mapping, or encoding issues).<br>3. Call outcome and status update reflect in CRM automatically without manual re-entry.<br>4. Sync failures (if any) are logged and visible in an error/audit log. |
| **Priority** | High |
| **Pass/Fail Criteria** | Fail if data mismatches between platform and CRM, or sync failures are silent (not logged/alerted). |

---

## TC-08: User Authentication, Role-Based Access Control & Activity Tracking

| Field | Details |
|---|---|
| **Test Case ID** | TC-08 |
| **Module** | User Features / Platform Security |
| **Objective** | Verify secure authentication, correct role-based permissions, and activity tracking/notifications. |
| **Preconditions** | At least two user roles exist: "Sales Rep" and "Admin". |
| **Test Steps** | 1. Register/log in as a Sales Rep using valid credentials; attempt login with invalid credentials (should fail).<br>2. As Sales Rep, attempt to access Admin-only settings (e.g., billing, user management).<br>3. Log in as Admin and access the same settings.<br>4. Perform a few actions as Sales Rep (view lead, launch campaign) and confirm they appear in Activity Tracking.<br>5. Trigger a notification event (e.g., new interested lead) and confirm the Sales Rep receives it. |
| **Test Data** | Roles: Sales Rep, Admin; Invalid login: wrong password x3 |
| **Expected Result** | 1. Valid credentials log in successfully; invalid credentials are rejected with an appropriate error, and repeated failures trigger lockout/throttling.<br>2. Sales Rep is blocked (403/hidden UI) from Admin-only areas.<br>3. Admin has full access to those areas.<br>4. All Sales Rep actions are logged with user, timestamp, and action type in the Activity Tracking log.<br>5. Notification is delivered to the correct user in near real-time. |
| **Priority** | Critical |
| **Pass/Fail Criteria** | Fail if role restrictions can be bypassed (e.g., via direct URL/API call) or activity isn't logged. |

---

## TC-09: Admin Dashboard — Subscription, Voice Usage, Billing & Fraud Detection

| Field | Details |
|---|---|
| **Test Case ID** | TC-09 |
| **Module** | Admin |
| **Objective** | Verify the Admin can monitor users, subscriptions, AI voice usage, billing, and fraud/audit logs from a centralized dashboard. |
| **Preconditions** | Multiple client accounts exist across Starter, Growth, and Enterprise tiers with recent AI voice call activity. |
| **Test Steps** | 1. Log in as Admin.<br>2. Open the Admin dashboard and review the Users panel — verify subscription tier, status, and usage per client.<br>3. Review AI Voice Usage — confirm minutes consumed match actual campaign call logs for a sample client.<br>4. Review Billing — confirm usage-based charges (voice minutes, contacts, API calls) are calculated correctly against the pricing model.<br>5. Simulate an anomalous pattern (e.g., unusually high call volume in a short window from one account) and check if fraud detection flags it.<br>6. Review the Audit Log for a recent sensitive action (e.g., a plan change or bulk lead export). |
| **Test Data** | 3 client accounts (1 per tier); 1 simulated anomalous usage spike |
| **Expected Result** | 1. Usage figures in the dashboard match actual system logs (no drift).<br>2. Billing calculations correctly reflect usage-based pricing for voice minutes, contacts, and API integrations per tier.<br>3. The anomalous usage spike is flagged for review (fraud detection).<br>4. Audit log entry exists for the sensitive action with user, timestamp, and details, and cannot be edited/deleted by non-super-admins. |
| **Priority** | High |
| **Pass/Fail Criteria** | Fail if usage/billing figures mismatch actual logs, or a flagged fraud event is missed. |

---

## TC-10: End-to-End User Journey — Trial Signup to Campaign Completion

| Field | Details |
|---|---|
| **Test Case ID** | TC-10 |
| **Module** | Cross-Module / End-to-End |
| **Objective** | Validate the complete user journey described in the spec, from registration to AI-driven prospect engagement and reporting. |
| **Preconditions** | None — fresh client account. |
| **Test Steps** | 1. Register on web or mobile app and start a free trial.<br>2. Submit company website, company details, business documents, and product/service info.<br>3. Confirm AI research runs and displays discovered opportunities with prospect details.<br>4. Subscribe to Lead Generation + AI Calling.<br>5. Configure calling (built-in or own infra) and product info; confirm validation step (auto or admin-routed).<br>6. Set target industries/locations/keywords and confirm continuous discovery begins.<br>7. Search/filter/export leads; upload an additional lead list.<br>8. Schedule and launch an AI Voice campaign.<br>9. Let the AI Voice Agent run through qualification, FAQ handling, callback/voicemail/retry logic, and generate transcripts/summaries.<br>10. Confirm interested prospects are auto-highlighted and handed off to the client.<br>11. Review campaign performance analytics and repeat the campaign on a schedule (daily/weekly/monthly). |
| **Test Data** | New trial account; 1 full campaign cycle |
| **Expected Result** | Each of the 12 user-journey steps in the spec completes successfully end-to-end with no broken handoffs between modules (Discovery → Enrichment → Validation → Campaign → Voice AI → Reporting), and analytics correctly reflect the full funnel (discovered → contacted → interested → handed off). |
| **Priority** | Critical |
| **Pass/Fail Criteria** | Fail if any step in the journey breaks, data doesn't carry over between steps (e.g., enriched lead data lost when pushed into a campaign), or the funnel analytics don't reconcile with actual counts. |

---

## Summary Table

| ID | Module | Priority |
|---|---|---|
| TC-01 | AI Lead Discovery | High |
| TC-02 | Lead Search/Filter/Export | High |
| TC-03 | Lead Management (Dedup/Upload) | High |
| TC-04 | AI Voice Agent (Call Flow) | Critical |
| TC-05 | Product Validation (Auto + Admin) | High |
| TC-06 | Market Intelligence | Medium |
| TC-07 | CRM Integration | High |
| TC-08 | Auth & RBAC | Critical |
| TC-09 | Admin Dashboard | High |
| TC-10 | End-to-End User Journey | Critical |
