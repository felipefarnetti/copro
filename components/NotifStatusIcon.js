"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader } from "lucide-react";

export default function NotifStatusIcon() {
  const [isReady, setIsReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);

  const checkSubscription = async () => {
    try {
      if (!window.OneSignal?.User?.PushSubscription) {
        console.warn("❌ OneSignal.PushSubscription non dispo");
        setIsSubscribed(false);
        return;
      }

      const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
      console.log("🔍 Résultat de checkSubscription :", optedIn);
      setIsSubscribed(optedIn ?? false);
    } catch (err) {
      console.warn("⚠️ Erreur checkSubscription :", err);
      setIsSubscribed(false);
    }
  };

  useEffect(() => {
    if (!window?.OneSignal) return;

    let timeoutId;

    const init = async () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        console.log("🟢 OneSignal prêt (NotifStatusIcon)");
        setIsReady(true);
        await checkSubscription();
      });

      // Fallback au cas où OneSignal ne déclenche jamais
      timeoutId = setTimeout(() => {
        if (isSubscribed === null) {
          console.warn("⏱️ Timeout - Forçage état : non abonné");
          setIsSubscribed(false);
        }
      }, 5000);
    };

    init();

    return () => clearTimeout(timeoutId);
  }, [isSubscribed]);

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
