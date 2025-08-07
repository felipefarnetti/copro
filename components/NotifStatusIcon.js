"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader } from "lucide-react";

export default function NotifStatusIcon() {
  const [isReady, setIsReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);

  // Vérifie si l'utilisateur est abonné
  const checkSubscription = async () => {
    try {
      if (window?.OneSignal?.User?.PushSubscription) {
        const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
        setIsSubscribed(optedIn);
      }
    } catch (e) {
      console.error("❌ Erreur checkSubscription :", e);
    }
  };

  useEffect(() => {
    if (!window?.OneSignal) return;

    console.log("🔄 OneSignal détecté");

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      console.log("🟢 OneSignal prêt dans NotifStatusIcon");
      setIsReady(true);
      await checkSubscription();
    });
  }, []);

  const handleClick = async () => {
    if (!isReady || !window.OneSignal?.Slidedown) {
      alert("OneSignal n’est pas encore prêt.");
      return;
    }

    try {
      const isOptedIn = await window.OneSignal.User.PushSubscription.optedIn;

      if (isOptedIn) {
        console.log("🔕 Déjà abonné");
        alert("Vous êtes déjà abonné aux notifications.");
      } else {
        console.log("🔔 Ouverture du prompt d’abonnement...");
        await window.OneSignal.Slidedown.promptPush();
        await checkSubscription();

        const updated = await window.OneSignal.User.PushSubscription.optedIn;
        if (updated) {
          alert("✅ Vous êtes maintenant abonné aux notifications !");
        }
      }
    } catch (e) {
      console.error("❌ Erreur d'abonnement :", e);
      alert("Une erreur est survenue lors de l'abonnement.");
    }
  };

  const className = "w-6 h-6 cursor-pointer transition hover:scale-110";

  if (isSubscribed === null)
    return <Loader className={className + " animate-spin text-gray-500"} />;

  if (isSubscribed)
    return (
      <Bell
        className={className + " text-green-500"}
        onClick={handleClick}
        title="Notifications activées"
      />
    );

  return (
    <BellOff
      className={className + " text-gray-400"}
      onClick={handleClick}
      title="Notifications désactivées"
    />
  );
}
