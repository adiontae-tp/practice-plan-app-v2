/**
 * Google Ads Campaign Creator for Practice Plan App
 *
 * Run with: npx ts-node scripts/create-google-ads-campaigns.ts
 */

import { GoogleAdsApi, enums, ResourceNames, toMicros } from "google-ads-api";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from web app
dotenv.config({ path: path.join(__dirname, "../src/apps/web/.env.local") });

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
});

const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID!;

// ============================================================================
// CAMPAIGN CONFIGURATIONS
// ============================================================================

const SEARCH_CAMPAIGN_CONFIG = {
  name: "Practice Plan App - Search - Web Signups",
  dailyBudget: 15, // $15/day
  keywords: [
    // High intent
    { text: "practice plan app", matchType: enums.KeywordMatchType.EXACT },
    { text: "practice planning software", matchType: enums.KeywordMatchType.EXACT },
    { text: "coaching practice planner", matchType: enums.KeywordMatchType.PHRASE },
    { text: "practice plan template", matchType: enums.KeywordMatchType.PHRASE },
    { text: "sports practice planner", matchType: enums.KeywordMatchType.PHRASE },
    // Broader
    { text: "coaching software", matchType: enums.KeywordMatchType.PHRASE },
    { text: "team management app for coaches", matchType: enums.KeywordMatchType.PHRASE },
    { text: "coach organization app", matchType: enums.KeywordMatchType.PHRASE },
  ],
  negativeKeywords: [
    "job", "jobs", "salary", "hiring", "career", "piano", "music", "medical", "therapy"
  ],
  headlines: [
    "Practice Plan App",
    "Plan Practice in Minutes",
    "Free Practice Planner",
    "Coaching Made Easy",
    "Build Better Practices",
    "Used by 10,000+ Coaches",
    "Create Plans in Minutes",
    "Try Free Today",
    "Pro Coaching Tools",
    "Organize Your Season",
    "Timed Drill Planner",
    "Save Hours Every Week",
    "Start Free - Upgrade Later",
    "Practice Planning Software",
    "Stop Using Spreadsheets",
  ],
  descriptions: [
    "Create structured practice plans with timed drills. Templates, PDF export & more.",
    "Build reusable period libraries. Share with coaching staff. Start free today.",
    "Professional practice planning for coaches. Web + mobile apps. Join 10,000+ coaches.",
    "Drag-and-drop practice builder. Calendar integration. Team collaboration features.",
  ],
  finalUrl: "https://practiceplan.app",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createCampaignBudget(dailyBudgetDollars: number): Promise<string> {
  console.log(`Creating campaign budget: $${dailyBudgetDollars}/day...`);

  const budgetResourceName = ResourceNames.campaignBudget(CUSTOMER_ID, `-1`);

  const response = await customer.campaignBudgets.create([
    {
      name: `Practice Plan App Budget - $${dailyBudgetDollars}/day - ${Date.now()}`,
      amount_micros: toMicros(dailyBudgetDollars),
      delivery_method: enums.BudgetDeliveryMethod.STANDARD,
    },
  ]);

  const resourceName = response.results[0].resource_name;
  console.log(`✅ Budget created: ${resourceName}`);
  return resourceName!;
}

async function createSearchCampaign(budgetResourceName: string): Promise<string> {
  console.log(`Creating Search campaign: ${SEARCH_CAMPAIGN_CONFIG.name}...`);

  const response = await customer.campaigns.create([
    {
      name: SEARCH_CAMPAIGN_CONFIG.name,
      advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
      status: enums.CampaignStatus.PAUSED, // Start paused for review
      campaign_budget: budgetResourceName,
      // Manual CPC to start, can switch to automated later
      manual_cpc: {
        enhanced_cpc_enabled: true,
      },
      // Network settings
      network_settings: {
        target_google_search: true,
        target_search_network: false, // Disable search partners initially
        target_content_network: false,
      },
      // Start and end dates
      start_date: new Date().toISOString().split("T")[0].replace(/-/g, ""),
    },
  ]);

  const resourceName = response.results[0].resource_name;
  console.log(`✅ Campaign created: ${resourceName}`);
  return resourceName!;
}

async function createAdGroup(campaignResourceName: string): Promise<string> {
  console.log("Creating Ad Group: Practice Planning...");

  const response = await customer.adGroups.create([
    {
      name: "Practice Planning - Core Keywords",
      campaign: campaignResourceName,
      status: enums.AdGroupStatus.ENABLED,
      type: enums.AdGroupType.SEARCH_STANDARD,
      cpc_bid_micros: toMicros(1.5), // $1.50 default bid
    },
  ]);

  const resourceName = response.results[0].resource_name;
  console.log(`✅ Ad Group created: ${resourceName}`);
  return resourceName!;
}

async function createKeywords(adGroupResourceName: string): Promise<void> {
  console.log("Adding keywords...");

  const keywords = SEARCH_CAMPAIGN_CONFIG.keywords.map((kw) => ({
    ad_group: adGroupResourceName,
    keyword: {
      text: kw.text,
      match_type: kw.matchType,
    },
    status: enums.AdGroupCriterionStatus.ENABLED,
  }));

  await customer.adGroupCriteria.create(keywords);
  console.log(`✅ Added ${keywords.length} keywords`);
}

async function createNegativeKeywords(campaignResourceName: string): Promise<void> {
  console.log("Adding negative keywords...");

  const negatives = SEARCH_CAMPAIGN_CONFIG.negativeKeywords.map((text) => ({
    campaign: campaignResourceName,
    keyword: {
      text,
      match_type: enums.KeywordMatchType.BROAD,
    },
    negative: true,
  }));

  await customer.campaignCriteria.create(negatives);
  console.log(`✅ Added ${negatives.length} negative keywords`);
}

async function createResponsiveSearchAd(adGroupResourceName: string): Promise<void> {
  console.log("Creating Responsive Search Ad...");

  const headlines = SEARCH_CAMPAIGN_CONFIG.headlines.map((text) => ({
    text,
  }));

  const descriptions = SEARCH_CAMPAIGN_CONFIG.descriptions.map((text) => ({
    text,
  }));

  await customer.adGroupAds.create([
    {
      ad_group: adGroupResourceName,
      ad: {
        responsive_search_ad: {
          headlines,
          descriptions,
          path1: "coaches",
          path2: "plans",
        },
        final_urls: [SEARCH_CAMPAIGN_CONFIG.finalUrl],
      },
      status: enums.AdGroupAdStatus.ENABLED,
    },
  ]);

  console.log(`✅ Responsive Search Ad created`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("       PRACTICE PLAN APP - GOOGLE ADS CAMPAIGN CREATOR      ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`\nCustomer ID: ${CUSTOMER_ID}`);
  console.log("\n");

  try {
    // Step 1: Create Budget
    const budgetResourceName = await createCampaignBudget(SEARCH_CAMPAIGN_CONFIG.dailyBudget);

    // Step 2: Create Campaign
    const campaignResourceName = await createSearchCampaign(budgetResourceName);

    // Step 3: Create Ad Group
    const adGroupResourceName = await createAdGroup(campaignResourceName);

    // Step 4: Add Keywords
    await createKeywords(adGroupResourceName);

    // Step 5: Add Negative Keywords
    await createNegativeKeywords(campaignResourceName);

    // Step 6: Create Ad
    await createResponsiveSearchAd(adGroupResourceName);

    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("                    🎉 SUCCESS!                            ");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\nCampaign created successfully!");
    console.log("\n⚠️  Campaign is PAUSED - review in Google Ads before enabling.");
    console.log("\nNext steps:");
    console.log("1. Go to ads.google.com");
    console.log("2. Review the campaign settings");
    console.log("3. Enable the campaign when ready");
    console.log("\n");

  } catch (error: any) {
    console.error("\n❌ Error creating campaign:");
    console.error(error.message);

    if (error.errors) {
      error.errors.forEach((e: any, i: number) => {
        console.error(`\nError ${i + 1}:`, JSON.stringify(e, null, 2));
      });
    }

    process.exit(1);
  }
}

main();
