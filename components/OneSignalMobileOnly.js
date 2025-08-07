"use client";
import { useEffect } from "react";

// Détection mobile
function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
}

export default function OneSignalMobileOnly({ email }) {
  useEffect(() => {
    if (!email || !isMobileBrowser()) {
      console.log("⏳ OneSignalMobileOnly attend un email...", email);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);
    console.log("📦 Script OneSignal injecté");

    script.onload = () => {
      console.log("✅ Script OneSignal chargé");

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        console.log("🟢 OneSignal prêt dans Deferred");

        try {
          await OneSignal.init({
            appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
          });
          console.log("✅ OneSignal initialisé");

          // Affiche le prompt si pas encore inscrit
          const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
          if (!isOptedIn) {
            console.log("🔔 Prompt d'inscription affiché");
            await OneSignal.Slidedown.promptPush();
          }

          // Après souscription, on peut associer l'email
          const isNowOptedIn = await OneSignal.User.PushSubscription.optedIn;
          if (isNowOptedIn && OneSignal.User?.setExternalUserId) {
            await OneSignal.User.setExternalUserId(email);
            console.log("📥 Email associé à OneSignal :", email);
          } else {
            console.warn("⛔ Impossible d’associer l’email, utilisateur non abonné");
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
