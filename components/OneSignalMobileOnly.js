"use client";
import { useEffect } from "react";

export default function OneSignalMobileOnly({ email }) {
  useEffect(() => {
    if (!email) {
      console.log("⏳ OneSignalMobileOnly attend un email...", email);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      console.log("🟢 OneSignal prêt dans Deferred");

      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          await OneSignal.init({ appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83" });
          console.log("✅ OneSignal initialisé");

          // Associer l’utilisateur à OneSignal
          if (email && OneSignal.User && OneSignal.User.setExternalUserId) {
            await OneSignal.User.setExternalUserId(email);
            console.log("🟢 Utilisateur lié à OneSignal :", email);
          }
        } catch (e) {
          console.warn("❌ Erreur OneSignal init:", e);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [email]);

  return null;
}
