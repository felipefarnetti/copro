"use client";
import { Bell } from "lucide-react";

export default function NotifStatusIcon() {
  const handleClick = async () => {
    console.log("🔘 Icône cliquée");

    if (!window?.OneSignal?.Slidedown) {
      alert("OneSignal n’est pas encore prêt.");
      return;
    }

    try {
      const canPrompt = await window.OneSignal.Slidedown.canPrompt();
      if (!canPrompt) {
        alert("Vous avez déjà autorisé ou refusé les notifications.");
        return;
      }

      console.log("🔔 Ouverture du prompt d'abonnement...");
      await window.OneSignal.Slidedown.promptPush();
    } catch (e) {
      console.error("❌ Erreur d'abonnement :", e);
    }
  };

  return (
    <Bell
      onClick={handleClick}
      className="w-6 h-6 cursor-pointer transition hover:scale-110 text-white"
    />
  );
}
