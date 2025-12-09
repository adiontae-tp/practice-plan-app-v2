# TestFlight Deployment via GitHub Actions

## ✅ Current Setup Status

Your GitHub Actions workflow is **correctly configured** to submit iOS builds to TestFlight!

### What's Already Configured

1. ✅ **GitHub Actions workflow** (`.github/workflows/eas-build.yml`)
2. ✅ **EAS submit configuration** (`eas.json`)
3. ✅ **Apple credentials** in `eas.json`:
   - Apple ID: `adiontae.gerron@gmail.com`
   - ASC App ID: `1597661338`
   - Apple Team ID: `QNS86FH9WM`

---

## How It Works

### Manual Deployment (Workflow Dispatch)

1. Go to [GitHub Actions](https://github.com/YOUR_REPO/actions)
2. Click **"EAS Build"** workflow
3. Click **"Run workflow"** button
4. Select options:
   - **Platform**: `ios`
   - **Submit to TestFlight**: `✓` (checked)
   - **Force build**: Only if you want to skip OTA check
5. Click **"Run workflow"**

The workflow will:
- ✅ Install dependencies
- ✅ Build iOS app (production profile)
- ✅ **Automatically submit to TestFlight** via `--auto-submit` flag
- ⏱️ Takes ~20-30 minutes total

### Automatic Deployment (On Push to Main)

Currently **disabled for production builds**. The workflow only triggers:
- **Development builds** when native changes are detected
- **OTA updates** when only JavaScript changes are detected

To enable automatic TestFlight on every main push, you'd need to modify the workflow.

---

## Required GitHub Secret

The workflow needs one secret configured in your GitHub repository:

### `EXPO_TOKEN`

This is your Expo access token that allows GitHub Actions to build and submit on your behalf.

**To verify it's set:**
1. Go to your GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Check if `EXPO_TOKEN` exists in the list

**If not set, create it:**
1. Get your Expo token:
   ```bash
   # Login to Expo CLI
   eas login
   
   # Generate token
   eas token:create --type publish
   ```
2. Copy the token
3. Add to GitHub:
   - Go to repo **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `EXPO_TOKEN`
   - Value: (paste token)
   - Click **"Add secret"**

---

## Apple App Store Connect Setup

### Required for Auto-Submit

EAS needs permission to submit to TestFlight. This should already be set up if you've submitted manually before, but verify:

1. **App-Specific Password** (if using Apple ID):
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Sign in
   - **Security** → **App-Specific Passwords**
   - Generate new password
   - Save it securely (you'll need it for first submission)

2. **App Store Connect API Key** (recommended):
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - **Users and Access** → **Integrations** → **App Store Connect API**
   - Generate a key with **Admin** role
   - Download the `.p8` key file
   - Save the **Issuer ID** and **Key ID**

**Configure EAS with API Key** (recommended for automation):
```bash
eas credentials
# Select iOS → production → App Store Connect API Key
# Upload your .p8 file and enter Issuer ID and Key ID
```

---

## Testing the Workflow

### Option 1: Manual Trigger (Recommended)

1. Go to [GitHub Actions](https://github.com/YOUR_REPO/actions/workflows/eas-build.yml)
2. Click **"Run workflow"**
3. Options:
   - Platform: `ios`
   - Submit to TestFlight: `✓` (checked)
4. Click **"Run workflow"**
5. Watch the logs in real-time

### Option 2: Command Line

```bash
# Trigger from command line (if GitHub CLI installed)
gh workflow run eas-build.yml \
  -f platform=ios \
  -f submit_to_testflight=true \
  -f force_build=false
```

---

## What Happens After Submission

1. **Build completes** (~15-20 minutes)
2. **Submitted to TestFlight** automatically
3. **Apple processes build** (~5-15 minutes)
   - Appears as "Processing" in App Store Connect
4. **Build ready for testing** in TestFlight
5. **Notify testers** (if configured in App Store Connect)

### Where to Check Status

- **GitHub Actions**: Build and submission logs
- **EAS Dashboard**: [expo.dev/accounts/adiontae/projects/practice-plan-app/builds](https://expo.dev/accounts/adiontae/projects/practice-plan-app/builds)
- **App Store Connect**: [TestFlight tab](https://appstoreconnect.apple.com/apps/1597661338/testflight/ios)

---

## Troubleshooting

### Build Succeeds but Not in TestFlight

**Check:**
- EAS build logs for submission errors
- App Store Connect → TestFlight for "Processing" status
- Email from Apple about build issues

**Common causes:**
- Missing App Store Connect API credentials
- Invalid Apple ID/password
- Missing export compliance information

### "Invalid Credentials" Error

**Solution:**
```bash
# Reconfigure credentials
eas credentials

# Or submit manually once to verify credentials
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

### Build Version Already Exists

**Solution:**
- EAS auto-increments build numbers (`"autoIncrement": true` in eas.json)
- If it fails, manually increment in `app.json`:
  ```json
  "ios": {
    "buildNumber": "137"  // Increment this
  }
  ```

### "Resource Not Found" Error

**Solution:**
- Verify `ascAppId` in `eas.json` matches your App Store Connect app
- Check: [App Store Connect](https://appstoreconnect.apple.com/apps/1597661338)

---

## Workflow Configuration Reference

### Current Profiles

| Profile | Purpose | Auto-Submit | Distribution |
|---------|---------|-------------|--------------|
| `development` | Local dev/simulator | ❌ | Internal |
| `development-device` | Device testing | ❌ | Internal |
| `preview` | Internal testing | ❌ | Internal |
| `production` | **TestFlight/App Store** | ✅ | App Store |

### Production Build Command

What the workflow runs:
```bash
eas build --platform ios --profile production --auto-submit --non-interactive
```

Flags:
- `--profile production`: Uses production config from `eas.json`
- `--auto-submit`: Submits to TestFlight after build completes
- `--non-interactive`: Runs without prompts (for CI/CD)

---

## Manual Commands (Alternative to GitHub Actions)

If you prefer to build/submit manually:

```bash
# Build and submit in one command
eas build --platform ios --profile production --auto-submit

# Or build first, submit later
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest

# Check build status
eas build:list --platform ios --profile production
```

---

## Notifications

### Get notified when builds complete:

1. **EAS Notifications**:
   - Go to [expo.dev/accounts/adiontae/settings/notifications](https://expo.dev/accounts/adiontae/settings/notifications)
   - Enable build notifications

2. **GitHub Notifications**:
   - Watch the repository
   - Enable Actions notifications

3. **Apple Notifications**:
   - App Store Connect → TestFlight → Notifications
   - Enable "New build available"

---

## Best Practices

1. **Test locally first**: Build and submit manually before using CI/CD
2. **Monitor builds**: Watch the first few automated builds closely
3. **Version control**: Always commit changes before triggering builds
4. **Incremental rollout**: Start with internal testing before wide release
5. **Keep credentials secure**: Never commit tokens or passwords

---

## Quick Checklist

Before your first automated TestFlight deployment:

- [ ] `EXPO_TOKEN` secret configured in GitHub
- [ ] Apple credentials set up in EAS (`eas credentials`)
- [ ] App exists in App Store Connect (ID: 1597661338)
- [ ] TestFlight beta testing enabled
- [ ] At least one test group created in TestFlight
- [ ] Manual submission tested and working
- [ ] GitHub Actions workflow triggers correctly

---

**Status**: ✅ Ready to deploy to TestFlight via GitHub Actions!

**To deploy now**: Go to Actions → EAS Build → Run workflow → Select iOS + TestFlight




