"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader } from "lucide-react";

export default function NotifStatusIcon() {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(null); // null = loading

  useEffect(() => {
    const checkStatus = async () => {
      if (!window?.OneSignal?.User?.PushSubscription) {
        setReady(false);
        return;
      }
      setReady(true);
      const isEnabled = await window.OneSignal.User.PushSubscription.optedIn;
      setEnabled(isEnabled);
    };

    // Petit délai pour laisser le SDK se charger
    setTimeout(checkStatus, 1000);
  }, []);

  const handleClick = async () => {
    if (!ready) {
      alert("🔄 OneSignal n’est pas encore prêt.");
      return;
    }

    if (enabled) {
      alert("🔔 Notifications déjà activées.");
    } else {
      try {
        await window.OneSignal.Slidedown.promptPush();
        console.log("🔔 Demande d’abonnement affichée");
      } catch (err) {
        console.error("❌ Erreur à l’abonnement :", err);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      title={
        enabled === null
          ? "Chargement du statut..."
          : enabled
          ? "Notifications activées"
          : "Notifications désactivées (cliquer pour activer)"
      }
      className="text-white hover:text-yellow-400 transition p-1"
    >
      {enabled === null && <Loader className="animate-spin w-6 h-6" />}
      {enabled === true && <Bell className="w-5 h-5 text-green-500" />}
      {enabled === false && <BellOff className="w-6 h-6 text-yellow-300" />}
    </button>
  );
}
