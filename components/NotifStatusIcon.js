"use client";
import { useEffect, useState } from "react";

export default function NotifStatusIcon() {
  const [status, setStatus] = useState("loading"); // 'loading' | 'enabled' | 'disabled' | 'error'

  useEffect(() => {
    let interval;
    const checkStatus = async () => {
      if (!window.OneSignal || !window.OneSignal.User?.PushSubscription) {
        return;
      }

      try {
        const isSubscribed = await window.OneSignal.User.PushSubscription.optedIn;
        setStatus(isSubscribed ? "enabled" : "disabled");
      } catch (err) {
        console.warn("Erreur check OneSignal:", err);
        setStatus("error");
      }
    };

    interval = setInterval(() => {
      if (window.OneSignal?.User?.PushSubscription) {
        clearInterval(interval);
        checkStatus();
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (status) {
      case "enabled":
        return "✅";
      case "disabled":
        return "🔔";
      case "loading":
        return "⏳";
      case "error":
        return "❌";
      default:
        return "❓";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "enabled":
        return "Notifications activées";
      case "disabled":
        return "Notifications désactivées";
      case "loading":
        return "Chargement des notifications...";
      case "error":
        return "Erreur OneSignal";
      default:
        return "Statut inconnu";
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="text-white text-xl cursor-default" title={getLabel()}>
        {getIcon()}
      </div>
    </div>
  );
}
