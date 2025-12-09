import { GoogleAdsApi } from "google-ads-api";

// Google Ads API Client Configuration
export const googleAdsClient = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

// Get customer instance for making API calls
export const getCustomer = () => {
  return googleAdsClient.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  });
};

// Customer ID without dashes
export const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID!;
