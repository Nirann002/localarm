# Building the native Android app

Localarm now uses a native background location watcher, so the alarm and the
arrival notification keep working with the screen off and the app in the
background. Android keeps the tracking alive as a **foreground service** with a
small persistent "Localarm is watching your trip" notification — that is what
the OS requires in exchange for background GPS.

## One-time setup on your machine

1. Push this project to GitHub (Export to GitHub), then `git clone` / `git pull`.
2. `npm install`
3. `npx cap add android`
4. `npm run build`
5. `npx cap sync android`
6. `npx cap run android` (needs Android Studio installed)

Repeat steps 4 and 5 after every `git pull`.

## Required permissions

Add these to `android/app/src/main/AndroidManifest.xml`, inside `<manifest>`
and above `<application>`:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

And inside `<application>`:

```xml
<service
    android:name="com.equimaps.capacitor_background_geolocation.BackgroundGeolocationService"
    android:foregroundServiceType="location"
    android:enabled="true"
    android:exported="false" />
```

## What the user must allow on the phone

- Location: choose **Allow all the time** (not "only while using the app"),
  otherwise Android stops updates once the app is backgrounded.
- Notifications: allow, so the arrival alert can appear on the lock screen.
- Battery: exclude Localarm from battery optimisation on aggressive OEMs
  (Xiaomi, Oppo, Vivo, Samsung) or the system may still kill the service.

## Play Store note

Google requires a written justification for `ACCESS_BACKGROUND_LOCATION`.
Explain that the app must monitor the traveller's position while the phone is
locked in order to sound a wake-up alarm at the destination.
