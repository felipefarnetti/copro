"use client";
import { useEffect } from "react";

function isMobileBrowser() {
  return true; // ← temporairement pour test desktop
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

          // Attendre que User soit disponible
          const checkUserReady = async (attempts = 10) => {
            for (let i = 0; i < attempts; i++) {
              if (OneSignal.User?.setExternalUserId) {
                console.log("📥 Enregistrement email OneSignal :", email);
                await OneSignal.User.setExternalUserId(email);
                return;
              }
              console.log("⏳ Attente User.setExternalUserId...");
              await new Promise((r) => setTimeout(r, 500));
            }
            console.warn("❌ OneSignal.User.setExternalUserId indisponible après attente");
          };

          if (email) {
            await checkUserReady();
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
