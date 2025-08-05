"use client";
import { useState } from "react";

export default function NotificationPanel() {
  const [notifMsg, setNotifMsg] = useState("");
  const [notifStatus, setNotifStatus] = useState("");

  const envoyerNotification = async () => {
    setNotifStatus("");
    if (!notifMsg.trim()) {
      setNotifStatus("Le message ne doit pas être vide.");
      return;
    }
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Notification du Syndic",
        message: notifMsg,
      }),
    });
    if (res.ok) {
      setNotifStatus("Notification envoyée !");
      setNotifMsg("");
    } else {
      setNotifStatus("Erreur lors de l'envoi.");
    }
  };

  return (
    <div className="w-full mb-6 flex flex-col items-center bg-white/80 p-4 rounded-xl shadow">
      <label className="font-semibold text-blue-800 mb-1">
        Envoyer une notification à tous les habitants
      </label>
      <div className="flex w-full max-w-lg gap-2">
        <input
          type="text"
          value={notifMsg}
          onChange={e => setNotifMsg(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 border rounded p-2"
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={envoyerNotification}
          type="button"
        >
          Envoyer
        </button>
      </div>
      {notifStatus && (
        <div className={"mt-2 text-sm " + (notifStatus.includes("Erreur") ? "text-red-500" : "text-green-600")}>
          {notifStatus}
        </div>
      )}
    </div>
  );
}
