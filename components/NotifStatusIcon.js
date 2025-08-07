"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader } from "lucide-react";

export default function NotifStatusIcon() {
  const [isReady, setIsReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);

  // Vérifie si l'utilisateur est abonné
  const checkSubscription = async () => {
    try {
      const optedIn = await window.OneSignal?.User?.PushSubscription?.optedIn;
      setIsSubscribed(optedIn ?? false);
    } catch (err) {
      console.warn("⚠️ Erreur checkSubscription :", err);
    }
  };

  useEffect(() => {
    if (!window?.OneSignal) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      console.log("🟢 OneSignal prêt");
      setIsReady(true);
      await checkSubscription();
    });
  }, []);

  const handleClick = async () => {
    console.log("🔘 Icône cliquée");

    if (!isReady || !window.OneSignal?.Slidedown) {
      alert("OneSignal n’est pas encore prêt.");
      return;
    }

    try {
      const canPrompt = await window.OneSignal.Slidedown.canPrompt();
      console.log("📊 Peut-on afficher le prompt ?", canPrompt);

      if (!canPrompt) {
        alert("Vous avez déjà autorisé ou refusé les notifications.");
        return;
      }

      console.log("🔔 Ouverture du prompt d'abonnement...");
      await window.OneSignal.Slidedown.promptPush();
      await checkSubscription();
    } catch (e) {
      console.error("❌ Erreur d'abonnement :", e);
    }
  };

  const className = "w-6 h-6 cursor-pointer transition hover:scale-110";

  if (isSubscribed === null)
    return <Loader className={className + " animate-spin text-gray-500"} />;

  if (isSubscribed)
    return <Bell className={className + " text-green-500"} onClick={handleClick} />;

  return <BellOff className={className + " text-gray-400"} onClick={handleClick} />;
}
