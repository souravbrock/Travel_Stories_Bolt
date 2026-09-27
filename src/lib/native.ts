// Detect the Capacitor native shell (APK). The web build never sets this.
export function isNativeApp(): boolean {
  try {
    const w = window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean };
    };
    return w.Capacitor?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
}
