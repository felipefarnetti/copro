"use client";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
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
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-300">
      <div className="sm:w-full w-[90vw] max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-blue-700 drop-shadow-sm text-center">Espace Copropriété</h1>
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/90 shadow-xl rounded-2xl p-8 border border-blue-100"
        >
          <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Connexion</h2>
          <label className="block mb-1 text-blue-700 font-medium">Adresse email</label>
          <input
            type="email"
            placeholder="exemple@email.com"
            required
            className="input-custom mb-3"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
          />
          <label className="block mb-1 text-blue-700 font-medium">Mot de passe</label>
          <input
            type="password"
            placeholder="Mot de passe"
            required
            className="input-custom mb-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
          <button
            className="btn-custom w-full mt-3"
            type="submit"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
