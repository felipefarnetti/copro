"use client";
import { useEffect } from "react";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent);
}

export default function OneSignalMobileOnly() {
  useEffect(() => {
    if (!isMobileBrowser()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userEmail = payload?.email;

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        await OneSignal.init({
          appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
        });

        await OneSignal.Slidedown.promptPush();

        // ✅ Appel VRAI du SDK v16
        if (userEmail && OneSignal?.User?.setExternalUserId) {
          try {
            await OneSignal.User.setExternalUserId(userEmail);
            console.log("✅ ExternalUserId enregistré :", userEmail);
          } catch (e) {
            console.error("❌ Erreur setExternalUserId :", e);
          }
        } else {
          console.warn("🚫 OneSignal.User.setExternalUserId indisponible");
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
