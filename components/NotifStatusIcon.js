"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader } from "lucide-react";

export default function NotifStatusIcon() {
  const [isReady, setIsReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);

  // Vérifie si l'utilisateur est abonné
  const checkSubscription = async () => {
    if (window?.OneSignal?.User?.PushSubscription) {
      const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
      setIsSubscribed(optedIn);
    }
  };

  useEffect(() => {
    if (!window?.OneSignal) return;
    console.log("🔄 OneSignal détecté");

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      console.log("🟢 OneSignal prêt");
      setIsReady(true);
      await checkSubscription();
    });
  }, []);

  const handleClick = async () => {
    if (!isReady || !window.OneSignal?.Slidedown) {
      alert("OneSignal n’est pas prêt");
      return;
    }

    console.log("🔔 Ouverture du prompt d'abonnement...");
    try {
      await window.OneSignal.Slidedown.promptPush();
      await checkSubscription();
    } catch (e) {
      console.error("❌ Erreur d'abonnement :", e);
    }
  };

  const className = "w-6 h-6 cursor-pointer transition hover:scale-110";

  if (isSubscribed === null) return <Loader className={className + " animate-spin text-gray-500"} />;
  if (isSubscribed) return <Bell className={className + " text-green-500"} onClick={handleClick} />;
  return <BellOff className={className + " text-gray-400"} onClick={handleClick} />;
}
