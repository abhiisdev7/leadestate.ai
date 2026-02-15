# Leadestate Voice – Demo Test Cases

Use this document to test all flows in the demo. Run each case one by one and verify the expected outcomes.

---

## Prerequisites

- Dev server running (`bun run dev`)
- MongoDB running (Docker: `docker-compose up -d`)
- Seed data loaded: `curl -X POST http://localhost:3000/api/seed`
- SMTP configured in `.env` for meeting emails (optional for demo)

---

## 1. Inbound Flow – Buyer Schedules a Call

**Goal:** Simulate an inbound buyer who qualifies and schedules a discovery call.

**Steps:**
1. Go to `/` (Voice Chat).
2. Click or type: "I'm looking to buy a home".
3. Answer the AI's questions: intent (buy), budget (e.g. $450,000), location (e.g. Austin, TX), timeline.
4. When asked for contact info, provide: name, phone, and **email** (email is required).
5. When the AI offers to schedule a call, agree and provide a date/time (e.g. "Tuesday at 2pm").
6. Confirm the slot when the AI proposes it.

**Expected:**
- AI asks for email before scheduling.
- `schedule_call` tool runs with name, phone, email, date, time.
- Success screen appears: "Call scheduled" with option to start new chat.
- Lead appears in CRM at `/crm` with channel "Inbound".
- Meeting appears in "Upcoming Meetings" (top 6).
- If SMTP is configured, a confirmation email is sent to the provided email.

---

## 2. Inbound Flow – Seller Inquiries

**Goal:** Simulate an inbound seller inquiry.

**Steps:**
1. Go to `/` (Voice Chat).
2. Type or say: "I want to sell my property".
3. Answer: location, timeline, motivation (e.g. "Upsizing for family").
4. Provide name, phone, and email when asked.
5. Optionally schedule a call or end the conversation.

**Expected:**
- AI qualifies as seller (intent: sell).
- Lead is created/updated in CRM.
- No suggested properties shown for sellers (buyers only).

---

## 3. Schedule Call – Email Required

**Goal:** Verify the AI does not schedule without email.

**Steps:**
1. Go to `/` and start a new chat.
2. Provide name and phone only (omit email).
3. Try to schedule a call (e.g. "Can we schedule a call for tomorrow at 3pm?").

**Expected:**
- AI asks for email before proceeding with scheduling.
- Call is not scheduled until email is provided.

---

## 4. CRM – View Leads and Meetings

**Goal:** Verify CRM displays leads and meetings from the database.

**Steps:**
1. Go to `/crm`.
2. Check "Upcoming Meetings" section (top 6 by date).
3. Check "Leads" table with columns: Name, Intent, Channel, Status, Budget, Location, Timeline, Score, Next Action.
4. Use search to filter by name, email, phone, or location.
5. Use tabs: All, Inbound, Outbound.

**Expected:**
- Meetings and leads load from `/api/leads`.
- Search filters the leads table.
- Tabs filter by channel (inbound/outbound).

---

## 5. CRM – Expand Lead and View Suggested Properties (Buyers Only)

**Goal:** Verify expandable row and suggested properties for buyers.

**Steps:**
1. Go to `/crm`.
2. Find a buyer lead (Intent: buy) with suggested properties.
3. Click the row to expand.
4. In "Suggested Properties", click a property card.

**Expected:**
- Expandable row shows Contact, Qualification, Meetings, Call Insights, Suggested Properties.
- Sellers do not show Suggested Properties.
- Clicking a property card navigates to `/properties/[id]`.

---

## 6. Properties – Grid, Add Property, Hover Actions

**Goal:** Verify properties page and card actions.

**Steps:**
1. Go to `/properties`.
2. Confirm properties are shown in a grid (not carousel).
3. Hover over a property card.
4. Verify overlay shows: arrow (details), Sold, Archive (for active) or Mark active (for sold/archived).
5. Click the arrow icon to go to property details.
6. Click "Add property" and add a new listing (address, city, state, price, beds, baths, etc.).

**Expected:**
- Grid layout: sm:2, lg:3, xl:4 columns.
- Arrow icon is rotated 45° and links to details.
- Sold/Archive/Mark active update status via PATCH.
- New property appears in the grid after add.

---

## 7. Property Details – Image Carousel and Centered Layout

**Goal:** Verify property details page with image carousel.

**Steps:**
1. Go to `/properties` and click a property with multiple images (or add one with 2+ image URLs).
2. Open property details.
3. If multiple images: use prev/next arrows to browse.
4. Check that content (image + details) is centered vertically and horizontally.

**Expected:**
- Multiple images: carousel with prev/next.
- Single image: single image display.
- No images: placeholder icon.
- Price and status badges overlay the image.
- Details (address, beds, baths, sqft, features) are centered on the page.

---

## 8. Chat Closes After Schedule

**Goal:** Verify chat closes when a call is successfully scheduled.

**Steps:**
1. Go to `/` and complete the full inbound schedule flow (name, phone, email, confirm slot).
2. Wait for `schedule_call` to succeed.

**Expected:**
- Chat clears and shows "Call scheduled" success screen.
- "Start new chat" and "View CRM" buttons are visible.
- Local storage lead ID is cleared for a fresh session.

---

## 9. Seed Data and API

**Goal:** Verify seed and APIs work.

**Steps:**
1. Run: `curl -X POST http://localhost:3000/api/seed`
2. Run: `curl http://localhost:3000/api/leads`
3. Run: `curl http://localhost:3000/api/properties`

**Expected:**
- Seed returns: `{ success: true, propertiesCount: 14, leadsCount: 4 }`.
- Leads API returns 4 leads (2 inbound, 2 outbound) with `suggested_properties` populated for buyers.
- Properties API returns 14 properties.

---

## 10. Meeting Email (If SMTP Configured)

**Goal:** Verify meeting confirmation email is sent for inbound scheduled calls.

**Steps:**
1. Ensure `.env` has SMTP_MAIL, SMTP_MAIL_PASSWORD, SMTP_MAIL_HOST, SMTP_MAIL_PORT.
2. Complete an inbound schedule flow with a real email address you can check.
3. Check inbox (and spam) for the confirmation email.

**Expected:**
- Email subject: "Your call is scheduled – [date] at [time]".
- Email body includes lead name, date, time, purpose.
- Styled HTML template.

---

## Quick Reference – Routes

| Route            | Purpose                          |
|------------------|----------------------------------|
| `/`              | Voice Chat (inbound users)       |
| `/crm`           | CRM Dashboard (owner)            |
| `/properties`    | Properties grid                  |
| `/properties/[id]` | Property details              |
| `POST /api/seed` | Seed properties + leads         |
| `POST /api/test/schedule-call` | Test schedule_call logic |

---

## Test Order Suggestion

1. **Seed** (Case 9) – Load data first.
2. **CRM** (Cases 4, 5) – Verify existing data.
3. **Properties** (Cases 6, 7) – Grid, add, details, carousel.
4. **Inbound** (Cases 1, 2, 3, 8) – Voice chat and schedule flow.
5. **Email** (Case 10) – If SMTP is set up.
