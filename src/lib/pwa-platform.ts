export type DevicePlatform =
  | "android"
  | "android_in_app"
  | "ios"
  | "ios_in_app"
  | "in_app"
  | "desktop"
  | "installed"
  | "unknown";

export interface PlatformSignals {
  userAgent: string;
  maxTouchPoints?: number;
  isStandalone?: boolean;
}

export function detectDevicePlatformFromSignals({
  userAgent,
  maxTouchPoints = 0,
  isStandalone = false,
}: PlatformSignals): DevicePlatform {
  if (isStandalone) return "installed";

  const isIOS =
    (/iPad|iPhone|iPod/.test(userAgent) && !/Windows Phone/i.test(userAgent)) ||
    (maxTouchPoints > 1 && /Macintosh/.test(userAgent));
  const isAndroid = /android/i.test(userAgent);
  const isInApp = /(FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Telegram|Snapchat|MicroMessenger|GSA|musical_ly)/i.test(
    userAgent
  );

  if (isIOS && isInApp) return "ios_in_app";
  if (isAndroid && isInApp) return "android_in_app";
  if (isInApp) return "in_app";
  if (isIOS) return "ios";
  if (isAndroid) return "android";

  return "desktop";
}
