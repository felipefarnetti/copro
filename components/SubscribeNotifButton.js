"use client";
import { useState } from "react";

export default function SubscribeNotifButton() {
  const [clicked, setClicked] = useState(false);

  const waitUntilReady = async () => {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const maxTries = 20;

      const check = () => {
        tries++;
        if (window.OneSignal?.User?.PushSubscription || window.OneSignal?.showSlidedownPrompt) {
          resolve(true);
        } else if (tries >= maxTries) {
          reject("OneSignal toujours indisponible");
        } else {
          setTimeout(check, 500);
        }
      };

      check();
    });
  };

  const handleClick = async () => {
    setClicked(true);
    console.log("🔘 Tentative d'abonnement OneSignal...");

    try {
      await waitUntilReady(); // 🕒 attendre que OneSignal soit prêt
    } catch (err) {
      alert("OneSignal n'est pas encore prêt.");
      console.warn(err);
      setClicked(false);
      return;
    }

    const isV16 = !!window.OneSignal.User?.PushSubscription;

    try {
      if (isV16) {
        const isSubscribed = await window.OneSignal.User.PushSubscription.optedIn;
        if (isSubscribed) {
          alert("✅ Déjà abonné (v16)");
        } else {
          await window.OneSignal.Slidedown.promptPush();
          console.log("🔔 Prompt affiché (v16)");
        }
      } else {
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        if (isSubscribed) {
          alert("✅ Déjà abonné (v15)");
        } else {
          await window.OneSignal.showSlidedownPrompt();
          console.log("🔔 Prompt affiché (v15)");
        }
      }
    } catch (e) {
      console.warn("❌ Erreur pendant l’abonnement :", e);
      alert("Erreur pendant l’abonnement.");
    }

    setClicked(false);
  };

  return (
    <button
      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg mt-8 shadow transition"
      onClick={handleClick}
      disabled={clicked}
    >
      🔔 S’abonner aux notifications
    </button>
  );
}
