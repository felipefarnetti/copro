"use client";
import { useState } from "react";

export default function SubscribeNotifButton() {
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    setClicked(true);
    // Ne refait PAS OneSignal.init ici !
    if (
      window.OneSignal &&
      window.OneSignal.Slidedown &&
      window.OneSignal.Slidedown.promptPush
    ) {
      await window.OneSignal.Slidedown.promptPush();
    } else {
      alert(
        "OneSignal n'est pas encore prêt ou non supporté par ce navigateur."
      );
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
