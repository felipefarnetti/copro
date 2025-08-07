"use client";
import { useState } from "react";

export default function SubscribeNotifButton() {
  const [clicked, setClicked] = useState(false);

const handleClick = async () => {
  setClicked(true);

  if (window.OneSignal?.User?.PushSubscription) {
    try {
      const isEnabled = await window.OneSignal.User.PushSubscription.optedIn;
      if (isEnabled) {
        console.log("🔕 Déjà inscrit aux notifications");
        alert("Vous êtes déjà abonné aux notifications.");
      } else {
        await window.OneSignal.Slidedown.promptPush();
        console.log("🔔 Demande d'abonnement forcée");
      }
    } catch (e) {
      console.warn("❌ Erreur lors du prompt :", e);
    }
  } else {
    alert("OneSignal n'est pas encore prêt ou non supporté par ce navigateur.");
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
      S’abonner aux notifications
    </button>
  );
}
