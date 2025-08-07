"use client";
import { useEffect } from "react";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
}

export default function OneSignalMobileOnly({ email }) {
  useEffect(() => {
    console.log("📲 OneSignalMobileOnly useEffect déclenché");

    if (!isMobileBrowser()) {
      console.log("📵 Navigateur non mobile : OneSignal ignoré");
      return;
    }

    console.log("📦 Injection du script OneSignal v16...");

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log("✅ Script OneSignal v16 chargé");
      window.OneSignalDeferred = window.OneSignalDeferred || [];

      window.OneSignalDeferred.push(async function (OneSignal) {
        console.log("🟢 OneSignal prêt dans Deferred");

        await OneSignal.init({
          appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
        });

        console.log("✅ OneSignal initialisé avec succès");

        await OneSignal.Slidedown.promptPush();
        console.log("🔔 Demande de permission affichée");

        try {
          await OneSignal.User.PushSubscription.optIn();
          console.log("✅ Utilisateur opt-in aux notifications");
        } catch (error) {
          console.warn("⚠️ Erreur opt-in :", error);
        }

        if (email) {
          try {
            await OneSignal.User.setExternalUserId(email);
            console.log("🟢 Utilisateur lié à OneSignal :", email);
          } catch (error) {
            console.warn("❗ OneSignal.User.setExternalUserId non disponible ou erreur :", error);
          }
        } else {
          console.warn("⚠️ Aucun email fourni pour setExternalUserId");
        }
      });
    };

    return () => {
      console.log("♻️ Script OneSignal retiré du DOM (cleanup)");
      document.head.removeChild(script);
    };
  }, [email]);

  return null;
}
