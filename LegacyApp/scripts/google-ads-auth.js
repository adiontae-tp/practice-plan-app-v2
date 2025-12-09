/**
 * Google Ads API - OAuth2 Refresh Token Generator
 *
 * Run this script to get your refresh token:
 * node scripts/google-ads-auth.js
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Your OAuth2 credentials from Google Cloud Console
const CLIENT_ID = '97952518690-9bo3oedmplf2kjaptngp7fe619468ak3.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

// Google Ads API scope
const SCOPE = 'https://www.googleapis.com/auth/adwords';

// Generate the authorization URL
function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Start local server to handle OAuth callback
function startServer() {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/oauth2callback') {
      const code = parsedUrl.query.code;

      if (code) {
        try {
          console.log('\n✅ Authorization code received!');
          console.log('Exchanging for tokens...\n');

          const tokens = await exchangeCodeForTokens(code);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h1>✅ Success!</h1>
                <p>You can close this window and check your terminal.</p>
              </body>
            </html>
          `);

          console.log('═══════════════════════════════════════════════════════════');
          console.log('              🎉 GOOGLE ADS API CREDENTIALS                 ');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('');
          console.log('Add these to your .env file:');
          console.log('');
          console.log(`GOOGLE_ADS_CLIENT_ID=${CLIENT_ID}`);
          console.log(`GOOGLE_ADS_CLIENT_SECRET=${CLIENT_SECRET}`);
          console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
          console.log(`GOOGLE_ADS_DEVELOPER_TOKEN=<your-developer-token>`);
          console.log(`GOOGLE_ADS_CUSTOMER_ID=6527143219`);
          console.log('');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('');
          console.log('Refresh Token:', tokens.refresh_token);
          console.log('');

          if (tokens.error) {
            console.error('Error:', tokens.error);
            console.error('Description:', tokens.error_description);
          }

          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 1000);

        } catch (error) {
          console.error('Error exchanging code:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error exchanging code for tokens');
        }
      } else {
        const error = parsedUrl.query.error;
        console.error('Authorization error:', error);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Authorization failed: ' + error);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.listen(3000, () => {
    const authUrl = getAuthUrl();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('         GOOGLE ADS API - OAUTH2 AUTHORIZATION             ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('1. Open this URL in your browser:');
    console.log('');
    console.log(authUrl);
    console.log('');
    console.log('2. Sign in with your Google account');
    console.log('3. Grant access to Google Ads');
    console.log('4. You will be redirected back here automatically');
    console.log('');
    console.log('Waiting for authorization...');
    console.log('');
  });
}

// Run
startServer();
