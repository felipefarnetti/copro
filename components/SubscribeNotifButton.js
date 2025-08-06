"use client";
import { useEffect, useState } from "react";

export default function SubscribeNotifButton() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Charge le SDK s'il n'est pas déjà présent
    if (!window.OneSignal) {
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => setReady(true);
      return () => document.head.removeChild(script);
    } else {
      setReady(true);
    }
  }, []);

  const handleClick = async () => {
    if (window.OneSignal && window.OneSignal.Slidedown) {
      await window.OneSignal.init({
        appId: "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83",
      });
      await window.OneSignal.Slidedown.promptPush();
    }
  };

  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4"
      onClick={handleClick}
      disabled={!ready}
    >
      S’abonner aux notifications
    </button>
  );
}
