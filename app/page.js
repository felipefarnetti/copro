"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showInstallHint, setShowInstallHint] = useState(false);

  useEffect(() => {
    // Enregistrement du service worker (si /sw.js existe)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW register error:", err);
      });
    }

    // Détection iOS Safari (pas de bannière d’install native)
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS/i.test(ua);
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      // iOS standalone legacy flag
      window.navigator?.standalone === true;

    if (isIos && isSafari && !isStandalone) {
      setShowInstallHint(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = data.role === "admin" ? "/admin" : "/dashboard";
    } else {
      setError(data.error || "Erreur");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-300 px-2">
      {/* Titre général */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-8 drop-shadow text-center">
        Gestion de Copropriété
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-4 sm:p-6 rounded w-full max-w-xs sm:max-w-md"
      >
        <h2 className="text-xl sm:text-2xl mb-4 text-blue-700 text-center">
          Connexion
        </h2>
        <input
          type="email"
          placeholder="Email"
          required
          className="input-custom mb-2 text-gray-900 text-sm sm:text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          required
          className="input-custom mb-2 text-gray-900 text-sm sm:text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        <button className="btn-custom w-full mb-2 text-sm sm:text-base py-2 sm:py-2">
          Se connecter
        </button>
        <div className="text-center mt-3">
          <span className="text-xs sm:text-sm text-gray-500">
            Pas encore de compte ?{" "}
          </span>
          <Link
            href="/register"
            className="text-blue-700 font-semibold underline text-xs sm:text-sm"
          >
            Créer un compte
          </Link>
        </div>
      </form>

      {/* Bandeau d’aide “Ajouter à l’écran d’accueil” (iOS/Safari) */}
      {showInstallHint && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-auto max-w-md bg-white text-gray-900 shadow-lg rounded-xl px-4 py-3 border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-lg">📲</span>
            <div className="text-sm">
              <div className="font-semibold text-blue-700">
                Installer l’app sur votre iPhone
              </div>
              <div>
                Ouvrez le menu <span className="font-semibold">Partager</span>{" "}
                puis choisissez{" "}
                <span className="font-semibold">
                  “Ajouter à l’écran d’accueil”
                </span>
                .
              </div>
            </div>
            <button
              onClick={() => setShowInstallHint(false)}
              className="ml-auto text-gray-500 hover:text-gray-700"
              aria-label="Fermer l’indication d’installation"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
