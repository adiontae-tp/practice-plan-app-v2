# Google Ads API - Tool Design Documentation

## 1. Tool Overview

**Tool Name:** Practice Plan App - Marketing Automation
**Company:** Practice Plan App
**Contact Email:** adiontae.gerron@gmail.com
**Website:** https://practiceplan.app

### Purpose
Internal marketing automation tool to manage Google Ads campaigns for Practice Plan App, a mobile and web application for sports coaches.

### Tool Type
- [x] Internal tool (for own business use)
- [ ] External tool (for third-party clients)

---

## 2. Intended Use of Google Ads API

### Primary Use Cases

1. **Campaign Management**
   - Create and manage Search, App, and Display campaigns
   - Update campaign budgets and bidding strategies
   - Pause/enable campaigns based on performance

2. **Ad Creation**
   - Create responsive search ads with multiple headlines/descriptions
   - Create app install campaign assets
   - Update ad copy for A/B testing

3. **Reporting**
   - Pull campaign performance metrics (impressions, clicks, conversions)
   - Generate daily/weekly performance reports
   - Monitor cost per install and cost per signup

4. **Keyword Management**
   - Add/remove keywords from ad groups
   - Update keyword bids
   - Add negative keywords

---

## 3. Target Accounts

### Account Structure
- **Manager Account ID:** 729-722-5248
- **Client Account ID:** 652-714-3219

### Account Relationship
This tool will only be used to manage our own Google Ads account(s) for marketing Practice Plan App. We do not provide services to third-party advertisers.

---

## 4. Technical Implementation

### Architecture
- **Backend:** Node.js / TypeScript
- **API Client:** google-ads-api npm package
- **Authentication:** OAuth 2.0 with refresh tokens
- **Hosting:** Vercel / Firebase Functions

### API Operations Used
- `GoogleAdsService.Search` - Reporting queries
- `GoogleAdsService.Mutate` - Create/update resources
- `CampaignService` - Campaign management
- `AdGroupService` - Ad group management
- `AdGroupAdService` - Ad creation
- `KeywordService` - Keyword management

### Estimated API Usage
- Daily operations: < 1,000 (well under Basic limit of 15,000)
- Primary usage: Campaign creation, performance reporting

---

## 5. Data Handling

### Data Storage
- API credentials stored securely in environment variables
- Performance data stored in Firebase Firestore
- No customer PII is collected or stored

### Data Retention
- Performance metrics retained for analytics purposes
- No Google Ads customer data shared with third parties

---

## 6. User Interface

### Screenshots / Mockups

Since this is an internal tool, the interface is a simple admin dashboard with:

1. **Campaign Overview** - List of active campaigns with key metrics
2. **Create Campaign** - Form to create new campaigns using predefined templates
3. **Performance Reports** - Charts showing spend, installs, and ROAS

---

## 7. Compliance

### Terms of Service
- We agree to comply with Google Ads API Terms and Conditions
- We agree to comply with Google Ads policies

### Data Use
- API data used solely for managing our own advertising
- No reselling or redistribution of Google Ads data

---

## 8. Contact Information

**Primary Contact:** Adiontae Gerron
**Email:** adiontae.gerron@gmail.com
**Phone:** 729-722-5248

---

*Document Version: 1.0*
*Date: December 2024*
