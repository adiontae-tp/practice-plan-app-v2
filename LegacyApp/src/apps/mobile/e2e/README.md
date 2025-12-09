# E2E Testing with Maestro

## Running Tests
To run all E2E flows and verify CRUD features with screenshots:
```bash
pnpm test:e2e
```
This will execute all flows in `e2e/flows`.

## Screenshots
Screenshots are automatically taken during the flows (e.g., `plan_created`, `plan_deleted`).
They are typically saved in `~/.maestro/` or the output directory if configured.

## Recording Videos
To record videos of the test execution:

### 1. Using Maestro Cloud (Recommended)
```bash
maestro cloud e2e/flows
```
This will automatically record videos of all flows.

### 2. Local Recording
You can use the platform's native recording tools while the test is running:

**iOS Simulator:**
```bash
xcrun simctl io booted recordVideo e2e/results/video.mp4
```

**Android Emulator:**
```bash
adb shell screenrecord /sdcard/video.mp4
```

### 3. Maestro Studio
To interactively create and debug flows with visual feedback:
```bash
maestro studio
```
