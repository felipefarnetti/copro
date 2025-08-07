"use client";
import { useEffect } from "react";

// Pour tests uniquement (forcer mobile)
const isMobileBrowser = () => true;

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

          // Si pas encore abonné, proposer le prompt
          const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
          if (!isOptedIn) {
            console.log("🔔 Affichage du prompt d'abonnement");
            await OneSignal.Slidedown.promptPush();
          }

          // Réessaie jusqu'à 10 fois pour setExternalUserId
          let attempts = 0;
          while (!OneSignal.User?.setExternalUserId && attempts < 10) {
            console.log("⏳ Attente User.setExternalUserId... (tentative", attempts + 1, ")");
            await new Promise(res => setTimeout(res, 1000));
            attempts++;
          }

          if (OneSignal.User?.setExternalUserId) {
            await OneSignal.User.setExternalUserId(email);
            console.log("📥 externalUserId enregistré :", email);
          } else {
            console.warn("❌ Impossible de définir setExternalUserId après 10 tentatives");
          }

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
