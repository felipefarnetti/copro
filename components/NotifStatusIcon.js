"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader } from "lucide-react";

export default function NotifStatusIcon() {
  const [isReady, setIsReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);

  const waitUntilReady = async () => {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const maxTries = 15;

      const check = () => {
        tries++;
        if (window.OneSignal?.User?.PushSubscription) {
          resolve(true);
        } else if (tries >= maxTries) {
          reject("❌ OneSignal non prêt");
        } else {
          setTimeout(check, 500);
        }
      };
      check();
    });
  };

  const checkSubscription = async () => {
    const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
    setIsSubscribed(optedIn);
  };

  useEffect(() => {
    waitUntilReady()
      .then(async () => {
        setIsReady(true);
        await checkSubscription();
      })
      .catch((err) => {
        console.warn(err);
        setIsReady(false);
        setIsSubscribed(null);
      });
  }, []);

  const handleClick = async () => {
    if (!isReady) {
      alert("OneSignal n’est pas encore prêt");
      return;
    }

    try {
      await window.OneSignal.Slidedown.promptPush();
      await checkSubscription();
    } catch (e) {
      console.error("❌ Erreur prompt :", e);
    }
  };

  const iconProps = { className: "w-6 h-6 cursor-pointer hover:scale-110 transition" };

  if (!isReady || isSubscribed === null) return <Loader className="w-6 h-6 animate-spin text-gray-400" />;
  if (isSubscribed) return <Bell {...iconProps} onClick={handleClick} style={{ color: "green" }} />;
  return <BellOff {...iconProps} onClick={handleClick} style={{ color: "gray" }} />;
}
