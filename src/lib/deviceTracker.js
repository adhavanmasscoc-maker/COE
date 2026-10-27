// Helper to parse device info, mobile detection, and IP address for anti-cheat verification

export function extractClientIp(request) {
  if (!request) return "127.0.0.1";
  
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

export function parseDevice(userAgent = "") {
  const ua = String(userAgent || "");

  const isIPhone = /iPhone/i.test(ua);
  const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && "ontouchend" in {});
  const isAndroid = /Android/i.test(ua);
  const isAndroidMobile = isAndroid && /Mobile/i.test(ua);
  const isAndroidTablet = isAndroid && !/Mobile/i.test(ua);
  const isWindows = /Windows/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua) && !isIPad;
  const isLinux = /Linux/i.test(ua) && !isAndroid;

  const isTablet = isIPad || isAndroidTablet || /Tablet|PlayBook/i.test(ua);
  const isMobile = (isIPhone || isAndroidMobile || /Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua)) && !isTablet;

  let os = "Unknown OS";
  if (isIPhone) os = "iOS (iPhone)";
  else if (isIPad) os = "iPadOS (iPad)";
  else if (isAndroidMobile) os = "Android Mobile";
  else if (isAndroidTablet) os = "Android Tablet";
  else if (isWindows) os = "Windows PC";
  else if (isMac) os = "macOS";
  else if (isLinux) os = "Linux";

  let browser = "Web Browser";
  if (/Edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";

  let deviceType = "💻 Desktop";
  if (isMobile) {
    deviceType = `📱 Mobile (${os} / ${browser})`;
  } else if (isTablet) {
    deviceType = `📟 Tablet (${os} / ${browser})`;
  } else {
    deviceType = `💻 Desktop (${os} / ${browser})`;
  }

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    os,
    browser,
    deviceType,
    rawUserAgent: ua,
  };
}
