"use client";
import { useEffect } from "react";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
}

export default function OneSignalMobileOnly() {
  useEffect(() => {
    console.log("🟡 OneSignalMobileOnly useEffect déclenché");

    if (!isMobileBrowser()) {
      console.log("❌ Navigateur non mobile, chargement OneSignal annulé");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ Aucun token trouvé dans localStorage");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userEmail = payload?.email;
    console.log("🟢 Utilisateur identifié :", userEmail);

    // Injecter dynamiquement le script OneSignal v16
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

        try {
          await OneSignal.init({
            appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
          });
          console.log("✅ OneSignal initialisé avec succès");

          await OneSignal.Slidedown.promptPush();
          console.log("🔔 Demande de permission affichée");

          if (userEmail && OneSignal?.User?.setExternalUserId) {
            console.log("🧠 Enregistrement de externalUserId...");
            await OneSignal.User.setExternalUserId(userEmail);
            console.log("✅ externalUserId enregistré :", userEmail);
          } else {
            console.warn("❗ OneSignal.User.setExternalUserId non disponible ou email manquant");
          }
        } catch (err) {
          console.error("❌ Erreur dans OneSignal Deferred :", err);
        }
      });
    };

    script.onerror = () => {
      console.error("❌ Échec du chargement du script OneSignal");
    };

    return () => {
      document.head.removeChild(script);
      console.log("♻️ Script OneSignal retiré du DOM (cleanup)");
    };
  }, []);

  return null;
}
