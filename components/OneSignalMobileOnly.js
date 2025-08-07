"use client";
import { useEffect } from "react";

const isMobileBrowser = () => {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
};

export default function OneSignalMobileOnly({ email }) {
  useEffect(() => {
    if (!email || !isMobileBrowser()) {
      console.log("⏳ OneSignalMobileOnly attend un email...", email);
      return;
    }

    // Ne pas injecter si déjà présent
    if (window.OneSignal) {
      console.warn("⚠️ SDK déjà injecté, on saute");
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
          // Initialisation si non déjà faite
          if (!OneSignal._initCalled) {
            await OneSignal.init({ appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83" });
            console.log("✅ OneSignal initialisé");
          } else {
            console.log("♻️ OneSignal déjà initialisé, on saute init");
          }

          // Vérifie si l'utilisateur est déjà abonné
          const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
          console.log("🔍 Déjà abonné ?", isOptedIn);

          if (!isOptedIn) {
            console.log("🔔 Affichage du prompt");
            await OneSignal.Slidedown.promptPush();
          }

        } catch (e) {
          console.error("❌ Erreur OneSignal:", e);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [email]);

  return null;
}
