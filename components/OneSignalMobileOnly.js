"use client";
import { useEffect } from "react";

// ⛔ TEMPORAIRE : désactivé pour tests sur desktop
function isMobileBrowser() {
  return true; // <-- forcer le test même sur desktop
}

export default function OneSignalMobileOnly({ email }) {
  useEffect(() => {
    if (!email || !isMobileBrowser()) return;

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          await OneSignal.init({
            appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
          });

          if (email) {
            await OneSignal.User.setExternalUserId(email);
          }
        } catch (err) {
          console.warn("⚠️ OneSignal init error:", err);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [email]);

  return null;
}
