# SugarCare — Explainable & Preventive AI for Diabetes Support

SugarCare is an AI-driven digital health application designed to support people living with diabetes through **preventive insight**, **explainable guidance**, and **everyday self-management tools**.  
It focuses on helping users understand how food and lifestyle patterns may influence glucose trends, enabling more proactive decisions beyond reactive logging.

## What SugarCare Does
- **Personalised Meal Guidance:** Context-aware meal suggestions tailored to individual health patterns and goals.
- **Food Recognition (Photo):** Estimates nutrition and glycaemic impact from meal images to support informed choices.
- **Predictive Sugar Trend Alerts:** Early alerts estimating potential spikes or dips in the near term based on recent patterns.
- **Risk Trend Awareness:** Highlights longer-term patterns to support early awareness of potential complication risks.

## Supporting Features
- Glucose tracking (fasting/random/post-meal) with trends
- Fasting logs with notes
- Weekly / monthly / yearly summaries and reports
- AI conversational assistant for general guidance and health awareness
- Community insights

## Why It’s Innovative
Most diabetes apps focus on tracking past values. SugarCare integrates **predictive awareness + personalised guidance + explainable insights** in a single preventive system, designed to be transparent, user-centred, and practical for daily life.

## Repository Contents
- **`/src`** — React Native app source (client/UI): `assets`, `components`, `context`, `hooks`, `navigation`, `redux`, `screens`, `services`, `utilities`
- **`/android`** — Android native project (Gradle, app module)
- **`/ios`** — iOS native project (Xcode, CocoaPods)
- **`/sugarcare_apis`** — Backend APIs and ML:
  - `api/` — route handlers, model inference, auth, profile, schemas
  - `config/` — settings, logger, model paths
  - `data/` — datasets and data utilities (no sensitive data in repo)
  - `db/` — database models and connection
  - `firebase/` — Firebase config (service account key is gitignored)
  - `models/` — trained model artifacts (large `.pkl`/`.pth` files are gitignored)
  - `notebooks/` — Jupyter notebooks for training (food, sugar alert, risk forecast, meal recommender, chatbot)
  - `services/` — auth, email, Firebase client, push notifications
  - `static/`, `templates/`, `utils/` — static assets, email templates, helpers
  - `main.py`, `requirements.txt`
- **`/docs`** — Product and setup docs (e.g. `IOS_XCODE_SETUP.md`)
- **`/scripts`** — Utility scripts (e.g. `remove-console-logs.sh`)
- **`/__tests__`** — Test files

## Status
Active development. Early-stage validation and collaboration discussions are ongoing.

## Contact
For collaboration, research, or validation discussions: **info@helixaai.com**

































This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
yarn ios
# OR
npm run ios
```

**First-time iOS / push notifications:** See **[docs/IOS_XCODE_SETUP.md](docs/IOS_XCODE_SETUP.md)** for Xcode setup (Push Notifications, GoogleService-Info.plist, APNs key).

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
