# Android APK (Capacitor shell around the live site)

The APK is a native WebView shell pointing at
`https://trvlstory.reddevils.co.in` — no separate mobile codebase, the app
is always current. Follows the same pattern as `tstory-android`.

## Project location

- CI / canonical: `mobile/` in this repo (built by the `Android APK`
  GitHub workflow; `android/` is regenerated every run and git-ignored).
- Local builds (optional): `C:\Users\soura\trvlstory-android` (same layout).

```
mobile/
  capacitor.config.json   appId com.reddevils.trvlstory, server.url = live site
  www/index.html          offline fallback page (bundled, shown without net)
  gen_icons.py            renders branded launcher icons (Pillow)
```

## Distribution

- **GitHub**: every push builds a debug APK (workflow artifact). Pushing a
  tag `v*` (e.g. `v1.0.0`) creates a public **Release** with the APK
  attached — download straight from the Releases page.
- **Obtanium**: in the Obtanium app, add `souravbrock/Travel_Stories_Bolt`
  as a GitHub source — it tracks Releases and offers updates automatically.
- **F-Droid**: F-Droid builds from source itself. A ready-to-submit draft
  lives at `fdroid/com.reddevils.trvlstory.yml`; submit it as a merge
  request to `fdroid/fdroiddata` (guide linked inside the file). Store
  metadata mirrors `fastlane/metadata/android/en-US/`.

## Prereqs (one-time, Windows — already done on this laptop)

- Temurin JDK 21 (portable, `C:\Java\jdk-21` — Capacitor 7.4 compiles
  against Java 21), `C:\Android\Sdk` with `platforms;android-35`,
  `build-tools;35.0.0` (`sdkmanager`), `ANDROID_SDK_ROOT` set.

## Rebuild the APK

```powershell
cd C:\Users\soura\trvlstory-android
npx cap sync android
cd android
$env:JAVA_HOME = "C:\Java\jdk-21"
.\gradlew.bat assembleDebug
# APK: android\app\build\outputs\apk\debug\app-debug.apk
```

Install directly on a phone (USB/file transfer/Drive). For Play Store
later: `assembleRelease` + sign with your own keystore (`keytool -genkey`)
+ Android App Bundle.

## Notes

- Debug APK is auto-signed with a debug key (fine for sideloading).
- Launcher icons are generated from the web brand (`gen_icons.py`):
  legacy + round PNGs and adaptive-icon foreground on `#1A6EF5`.
- Regenerating the native project: delete `android/`, rerun
  `npx cap add android`, rerun `gen_icons.py`, then build.
