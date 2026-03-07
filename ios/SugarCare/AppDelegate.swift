import Firebase
import FirebaseMessaging
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "SugarCare",
      in: window,
      launchOptions: launchOptions
    )
    FirebaseApp.configure()

    // Register for remote notifications after a short delay so iOS has time to be ready
    // (avoids "APNS token not set" when FCM token is requested from JS).
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
      application.registerForRemoteNotifications()
    }

    return true
  }

  /// Write APNs status to a file so the JS app can show it on the Notifications screen (no Xcode console needed).
  private func writeAPNsStatus(_ status: String) {
    guard let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return }
    let fileURL = dir.appendingPathComponent("apns_status.txt")
    try? status.write(to: fileURL, atomically: true, encoding: .utf8)
  }

  // Forward APNs token to Firebase so FCM can deliver to this device (required on real iOS devices).
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    #if DEBUG
    Messaging.messaging().setAPNSToken(deviceToken, type: .sandbox)
    print("[FCM] APNs token set for Firebase (sandbox). Push should work if APNs key is in Firebase Console.")
    writeAPNsStatus("registered")
    #else
    Messaging.messaging().setAPNSToken(deviceToken, type: .prod)
    print("[FCM] APNs token set for Firebase (production).")
    writeAPNsStatus("registered")
    #endif
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    let message = "failed: \(error.localizedDescription)"
    print("[FCM] Failed to register for remote notifications: \(error.localizedDescription)")
    writeAPNsStatus(message)
    // Common causes: Simulator (no push), no Push Notifications capability, or provisioning profile without push.
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
