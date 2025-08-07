"use client";
import { useState } from "react";

export default function SubscribeNotifButton() {
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    setClicked(true);
    console.log("🔘 Tentative d'abonnement OneSignal...");

    try {
      if (!window.OneSignal) {
        alert("OneSignal n'est pas encore prêt.");
        return;
      }

      const isV16 = !!window.OneSignal.User?.PushSubscription;

      if (isV16) {
        const isSubscribed = await window.OneSignal.User.PushSubscription.optedIn;
        if (isSubscribed) {
          alert("Vous êtes déjà abonné aux notifications.");
          console.log("✅ Déjà abonné (v16)");
        } else {
          await window.OneSignal.Slidedown.promptPush();
          console.log("🔔 Prompt affiché (v16)");
        }
      } else {
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        if (isSubscribed) {
          alert("Vous êtes déjà abonné aux notifications.");
          console.log("✅ Déjà abonné (v15)");
        } else {
          await window.OneSignal.showSlidedownPrompt();
          console.log("🔔 Prompt affiché (v15)");
        }
      }
    } catch (err) {
      console.warn("❌ Erreur pendant l'abonnement :", err);
      alert("Une erreur est survenue pendant l'abonnement.");
    }

    setClicked(false);
  };

  return (
    <button
      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg mt-8 shadow transition"
      onClick={handleClick}
      disabled={clicked}
      type="button"
    >
      🔔 S’abonner aux notifications
    </button>
  );
}
