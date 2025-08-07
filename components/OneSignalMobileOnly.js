"use client";
import { useEffect, useRef } from "react";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
}

export default function OneSignalMobileOnly({ email }) {
  const initializedRef = useRef(false); // évite double init

  useEffect(() => {
    console.log("📲 useEffect déclenché - email :", email);

    if (!isMobileBrowser()) {
      console.log("📵 Navigateur non mobile : OneSignal ignoré");
      return;
    }

    if (!email) {
      console.log("⏳ Email non encore disponible, on attend...");
      return; // stop ici tant que l'email n'est pas dispo
    }

    if (initializedRef.current) {
      console.log("🔁 OneSignal déjà initialisé");
      return;
    }

    initializedRef.current = true; // on bloque les futures initialisations

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log("✅ Script OneSignal chargé");
      window.OneSignalDeferred = window.OneSignalDeferred || [];

      window.OneSignalDeferred.push(async function (OneSignal) {
        console.log("🟢 OneSignal prêt dans Deferred");

        await OneSignal.init({
          appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
        });

        console.log("✅ OneSignal initialisé");

        try {
          await OneSignal.Slidedown.promptPush();
          console.log("🔔 Prompt affiché");

          await OneSignal.User.PushSubscription.optIn();
          console.log("📥 Utilisateur opt-in");

          await OneSignal.User.setExternalUserId(email);
          console.log("📧 externalUserId enregistré :", email);
        } catch (err) {
          console.warn("❌ Erreur dans l'enregistrement OneSignal :", err);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
      console.log("♻️ Script OneSignal retiré");
    };
  }, [email]);

  return null;
}
