# iOS Setup — Xcode & Push Notifications (SugarCare)

Do these steps **once** in Xcode so the app builds and push notifications work.

---

## 1. Open the project in Xcode

- Open **`ios/SugarCare.xcworkspace`** (not `.xcodeproj`).
- Select the **SugarCare** target.

---

## 2. Signing & Capabilities

1. Select the **SugarCare** project in the left sidebar → select the **SugarCare** target.
2. Open the **Signing & Capabilities** tab.
3. **Team**: Choose your Apple Developer team so signing works (required for device and push).
4. **Push Notifications**
   - Click **+ Capability**.
   - Add **Push Notifications**.
   - This adds the `aps-environment` entitlement (already present in `SugarCare.entitlements`; Xcode will keep it in sync).
5. **Background Modes**
   - Click **+ Capability** if **Background Modes** is not there.
   - Add **Background Modes** and enable:
     - **Remote notifications**

(Info.plist already has `UIBackgroundModes` → `remote-notification`; the capability ensures the entitlement matches.)

---

## 3. GoogleService-Info.plist

- **GoogleService-Info.plist** must be in the Xcode project and in the **SugarCare** target’s “Copy Bundle Resources”.
- If you added it to `ios/` or `ios/SugarCare/`:
  - In Xcode: right‑click **SugarCare** group → **Add Files to "SugarCare"** → select **GoogleService-Info.plist**.
  - Leave **Copy items if needed** unchecked if the file is already under `ios/SugarCare/`.
  - In **Build Phases** → **Copy Bundle Resources**, ensure **GoogleService-Info.plist** is listed.

---

## 4. APNs key in Firebase (required for FCM on iOS)

1. **Apple Developer**
   - [Apple Developer](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles** → **Keys**.
   - Create a key with **Apple Push Notifications service (APNs)** enabled; download the `.p8` and note the **Key ID**.
   - Note your **Team ID** and **Bundle ID** (e.g. from Xcode → target → General → **Bundle Identifier**).

2. **Firebase Console**
   - [Firebase Console](https://console.firebase.google.com) → your project → **Project settings** (gear) → **Cloud Messaging**.
   - Under **Apple app configuration**, upload your **APNs Authentication Key** (`.p8`), and enter **Key ID**, **Team ID**, and **Bundle ID**.

Without this, FCM cannot deliver to real devices (simulator may work in some cases with limited behavior).

---

## 5. Release / Production push

- For **development** (debug build): `aps-environment` = `development` (already set in `SugarCare.entitlements`).
- For **release** (TestFlight/App Store): use **production**.
  - Either:
    - In Xcode → **Signing & Capabilities** → ensure the correct provisioning profile is used for Release (Xcode often sets this automatically), and/or
    - In **SugarCare.entitlements** for Release, use `aps-environment` = `production` (some setups use a separate entitlements file for Release; if you use one, set it there).

---

## 6. Build from Xcode (optional)

- Select a simulator or a connected device.
- **Product** → **Run** (⌘R).
- If you use the CLI, run **`yarn ios`** from the project root.

---

## 7. Console.log on iOS

In React Native **0.77+**, JS logs are not sent to Metro by default, so `console.log` can appear on Android but not in the Metro terminal for iOS.

- **Fix**: Start Metro with client logs so both platforms show logs in the same terminal:
  - Run **`yarn start`** (the project’s `start` script already uses `--client-logs`).
  - In another terminal run **`yarn ios`** (or build from Xcode). All `console.log` output from the app will appear in the **Metro** terminal.
- If you start Metro yourself, use: `npx react-native start --client-logs`.

---

## 8. Troubleshooting

| Issue | Check |
|-------|--------|
| Build fails: missing `RCTAppDependencyProvider.h` | Run `node node_modules/react-native/scripts/generate-codegen-artifacts.js -p . -t ios -o ios` then build again. |
| Build fails: database is locked | Quit Xcode, stop any running build (Ctrl+C), then run `yarn ios` again. |
| **console.log not showing on iOS** | Start Metro with **`yarn start`** (uses `--client-logs`), then run the app. Logs appear in the Metro terminal. |
| No FCM token on device | Push Notifications + Background Modes (Remote notifications) in Xcode; APNs key uploaded in Firebase; run on a real device. |
| Simulator: no token / no push | Normal on many simulators; use a real device for full push testing. |
| "JSCRuntime does not support debugging over Chrome DevTools" | Normal with the new JS engine. Use **Metro terminal logs** for console output, or see FCM token **in the app**: open **Notifications** screen — in dev a "FCM Token" row appears; tap it to see/copy the token. On first launch the token also appears as a flash message. |

---

## Summary checklist

- [ ] Open **SugarCare.xcworkspace** in Xcode.
- [ ] **Signing & Capabilities**: Team set, **Push Notifications** and **Background Modes** (Remote notifications) added.
- [ ] **GoogleService-Info.plist** added to target and in **Copy Bundle Resources**.
- [ ] **Firebase Console**: APNs key (`.p8`) uploaded for the app’s Bundle ID.
- [ ] For release: **aps-environment** / provisioning set for production if needed.

After this, **`yarn ios`** and push notifications (FCM) are correctly configured for iOS.
