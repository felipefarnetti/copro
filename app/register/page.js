"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BATIMENTS = ["A", "B", "C", "D", "E", "H"];

export default function Register() {
  const [form, setForm] = useState({
    email: "", password: "",
    prenom: "", nom: "", telephone: "",
    batiment: "", appartement: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); setSuccess(false);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "copro" })
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Erreur");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-300 px-2">
      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-8 rounded-xl shadow-lg w-full max-w-xs sm:max-w-md">
        <h1 className="text-xl sm:text-2xl mb-5 text-blue-700 text-center font-bold">Créer un compte</h1>
        <input name="prenom" value={form.prenom} onChange={handleChange}
          placeholder="Prénom" required className="input-custom mb-2 text-gray-900 text-sm sm:text-base" />
        <input name="nom" value={form.nom} onChange={handleChange}
          placeholder="Nom" required className="input-custom mb-2 text-gray-900 text-sm sm:text-base" />
        <input name="telephone"  value={form.telephone} onChange={handleChange}
          placeholder="Téléphone" required className="input-custom mb-2 text-gray-900 text-sm sm:text-base" />
        {/* Sélecteur de bâtiment */}
        <select
          name="batiment"
          value={form.batiment}
          onChange={handleChange}
          required
          className="input-custom mb-2 text-gray-900 text-sm sm:text-base"
        >
          <option value="">Sélectionner un bâtiment</option>
          {BATIMENTS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input name="appartement" value={form.appartement} onChange={handleChange}
          placeholder="N° d'appartement" required className="input-custom mb-2 text-gray-900 text-sm sm:text-base"/>
        <input name="email" value={form.email} onChange={handleChange}
          type="email" placeholder="Email" required className="input-custom mb-2 text-gray-900 text-sm sm:text-base" />
        <input name="password" value={form.password} onChange={handleChange}
          type="password" placeholder="Mot de passe" required className="input-custom mb-2 text-gray-900 text-sm sm:text-base" />

        {error && <div className="text-red-600 text-center mb-2 text-sm">{error}</div>}
        {success && (
          <div className="text-green-600 text-center mb-4 text-sm">
            Inscription réussie !<br />
            <button type="button"
              className="mt-2 px-4 py-2 bg-blue-700 text-white rounded text-sm sm:text-base"
              onClick={() => router.push("/")}
            >
              Se connecter
            </button>
          </div>
        )}
        {!success && (
          <button className="btn-custom w-full mt-2 text-sm sm:text-base py-2 sm:py-2">Créer mon compte</button>
        )}
        <div className="mt-4 text-center">
          <span className="text-xs sm:text-sm text-gray-500">Déjà inscrit ? </span>
          <button type="button" onClick={() => router.push("/")}
            className="text-blue-700 font-semibold underline ml-1 text-xs sm:text-sm">
            Connexion
          </button>
        </div>
      </form>
    </main>
  );
}
