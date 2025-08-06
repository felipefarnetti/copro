"use client";
import { useEffect } from "react";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
}

export default function OneSignalMobileOnly() {
  useEffect(() => {
    if (!isMobileBrowser()) return;

    // Injecter SDK v16 dynamiquement
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
        });
        // 👉 Affiche le prompt d’abonnement juste après l'init !
        console.log("OneSignal =", OneSignal);

await OneSignal.Slidedown.promptPush();
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
