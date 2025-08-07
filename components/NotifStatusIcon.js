"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader } from "lucide-react";

export default function NotifStatusIcon() {
  const [isReady, setIsReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);

  const className = "w-6 h-6 cursor-pointer transition hover:scale-110";

  const checkSubscription = async () => {
    try {
      const pushStatus = window?.OneSignal?.User?.PushSubscription;
      if (pushStatus) {
        const optedIn = await pushStatus.optedIn;
        setIsSubscribed(optedIn);
        console.log("🔍 Statut abonnement :", optedIn);
      } else {
        console.warn("⏳ PushSubscription non disponible");
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error("❌ Erreur lors du checkSubscription :", e);
      setIsSubscribed(false);
    }
  };

  useEffect(() => {
    if (!window?.OneSignal) return;

    console.log("🔄 Détection OneSignal…");
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      console.log("🟢 OneSignal prêt dans NotifStatusIcon");
      setIsReady(true);
      await checkSubscription();
    });
  }, []);

  const handleClick = async () => {
    if (!isReady || !window.OneSignal?.Slidedown) {
      alert("OneSignal n’est pas prêt");
      return;
    }

    try {
      console.log("🔔 Ouverture du prompt OneSignal");
      await window.OneSignal.Slidedown.promptPush();
      await checkSubscription();
    } catch (e) {
      console.error("❌ Erreur lors du prompt OneSignal :", e);
    }
  };

  if (isSubscribed === null) {
    return <Loader className={`${className} animate-spin text-gray-500`} />;
  }

  if (isSubscribed) {
    return (
      <Bell
        className={`${className} text-green-500`}
        title="Notifications activées"
        onClick={handleClick}
      />
    );
  }

  return (
    <BellOff
      className={`${className} text-gray-400`}
      title="Activer les notifications"
      onClick={handleClick}
    />
  );
}
