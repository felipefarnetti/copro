"use client";
import { useEffect } from "react";

const isMobileBrowser = () => true; // pour forcer le test

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

          const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
          if (!isOptedIn) {
            console.log("🔔 Affichage du prompt d'abonnement");
            await OneSignal.Slidedown.promptPush();
          }

          // 👉 Ajout d'un tag "email" à l'utilisateur
          await OneSignal.User.addTag("email", email);
          console.log("🏷️ Tag email envoyé :", email);

        } catch (e) {
          console.error("❌ OneSignal init error:", e);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [email]);

  return null;
}
