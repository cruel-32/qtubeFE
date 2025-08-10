# iOS FCM 푸시 알림 구현 계획

## 1. 개요

이 문서는 `qtubeapps`의 iOS FCM 푸시 알림 구현을 위한 계획을 담고 있습니다. 아래 계획은 현재 프로젝트의 의존성 버전을 기반으로 작성되었습니다.

**주요 라이브러리 버전:**
* `@react-native-firebase/app`: `^22.4.0`
* `@react-native-firebase/messaging`: `^22.4.0`
* `expo`: `~53.0.20`
* `expo-notifications`: `^0.31.4`
* `react-native`: `0.79.5`

## 2. Firebase 설정

### 2.1. Apple 개발자 계정 설정

1.  **APNs (Apple Push Notification service) 인증 키 생성:**
    *   Apple 개발자 계정에서 APNs 인증 키를 생성하고 다운로드합니다.
    *   이 키는 Firebase에 업로드하여 FCM이 APNs와 통신할 수 있도록 합니다.

### 2.2. Firebase 프로젝트 설정

1.  **Firebase 프로젝트에 iOS 앱 추가:**
    *   Firebase 콘솔에서 `qtube` 프로젝트에 iOS 앱을 추가합니다.
    *   `GoogleService-Info.plist` 파일을 다운로드하여 Xcode 프로젝트에 추가합니다.
2.  **APNs 인증 키 업로드:**
    *   Firebase 프로젝트 설정 > 클라우드 메시징 > Apple 앱 구성에서 다운로드한 APNs 인증 키를 업로드합니다.

## 3. iOS 프로젝트 설정 (Xcode)

### 3.1. 기능(Capabilities) 추가

1.  **Push Notifications:**
    *   Xcode에서 `qtubeapps` 타겟의 "Signing & Capabilities" 탭으로 이동하여 "+ Capability"를 클릭하고 "Push Notifications"를 추가합니다.
2.  **Background Modes:**
    *   "Background Modes"를 추가하고 "Remote notifications"를 활성화합니다.

### 3.2. `AppDelegate.swift` 수정

`@react-native-firebase/messaging`의 최신 버전에 따라 `AppDelegate.swift` 파일에 다음 코드를 추가하여 Firebase를 초기화하고 알림을 처리합니다.

```swift
import UIKit
import Firebase

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Firebase 초기화
    FirebaseApp.configure()
    
    // ... 기타 코드
    
    return true
  }

  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().apnsToken = deviceToken
  }
}
```

## 4. React Native 코드 구현

### 4.1. `FCMService.ts` 수정

`@/modules/Notification/service/FCMService.ts` 파일에 다음 기능을 구현합니다.

1.  **권한 요청:**
    *   `@react-native-firebase/messaging`의 `requestPermission` 메소드를 사용하여 사용자에게 알림 권한을 요청합니다.
2.  **FCM 토큰 가져오기:**
    *   `messaging().getToken()`을 사용하여 FCM 토큰을 가져옵니다.
3.  **백그라운드/종료 상태 메시지 처리:**
    *   `messaging().onNotificationOpenedApp()`: 사용자가 알림을 탭하여 앱을 열었을 때 호출됩니다.
    *   `messaging().getInitialNotification()`: 앱이 종료된 상태에서 알림을 통해 열렸을 때 호출됩니다.
4.  **포그라운드 메시지 처리:**
    *   `messaging().onMessage()`를 사용하여 앱이 포그라운드에 있을 때 수신되는 메시지를 처리합니다. `expo-notifications`와 함께 사용하여 사용자에게 알림을 표시할 수 있습니다.

### 4.2. `NotificationService.ts` 수정

`@/modules/Notification/service/NotificationService.ts` 파일에 다음 기능을 수정 및 추가합니다.

1.  **iOS 권한 요청 로직 통합:**
    *   `requestPermission` 메소드에 `@react-native-firebase/messaging`를 사용한 권한 요청 로직을 통합합니다.
2.  **포그라운드 알림 표시:**
    *   `setupForegroundHandler` 메소드에서 `messaging().onMessage`를 사용하여 수신된 메시지를 `expo-notifications`의 `presentNotificationAsync`를 통해 표시하도록 수정합니다.

## 5. 테스트 계획

1.  **시뮬레이터 및 실제 기기 테스트:**
    *   시뮬레이터와 실제 기기 모두에서 알림이 정상적으로 수신되는지 테스트합니다.
2.  **상태별 테스트:**
    *   앱이 포그라운드, 백그라운드, 종료된 상태일 때 각각 알림을 보내고 수신 및 클릭 동작을 테스트합니다.
3.  **토큰 관리 테스트:**
    *   FCM 토큰이 정상적으로 생성되고 백엔드 서버로 전송되는지 확인합니다.
