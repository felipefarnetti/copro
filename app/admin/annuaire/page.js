"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BATIMENTS = ["A", "B", "C", "D", "E", "H"];

export default function Annuaire() {
  const [users, setUsers] = useState([]);
  const [batimentFilter, setBatimentFilter] = useState("Tous");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsers(data.filter(u => u.role === "copro")));
  }, []);

  // Filtrage par bâtiment
  let usersToShow = users;
  if (batimentFilter !== "Tous") {
    usersToShow = users.filter(u => u.batiment === batimentFilter);
  }
  // Groupe et trie
  const grouped = {};
  BATIMENTS.forEach(b => grouped[b] = []);
  usersToShow.forEach(u => {
    if (grouped[u.batiment]) grouped[u.batiment].push(u);
  });
  Object.keys(grouped).forEach(bat => {
    grouped[bat].sort((a, b) => {
      const nomCompare = a.nom.localeCompare(b.nom, "fr");
      if (nomCompare !== 0) return nomCompare;
      return a.prenom.localeCompare(b.prenom, "fr");
    });
  });

  return (
   <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-6 sm:py-10 px-1 sm:px-2 w-full">
      <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow mb-3">
        Annuaire des copropriétaires
      </h1>

      {/* Filtres bâtiments */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          className={`px-3 py-1 rounded ${batimentFilter === "Tous" ? "bg-blue-700 text-white" : "bg-white text-blue-700 border border-blue-200"} font-semibold shadow text-sm sm:text-base`}
          onClick={() => setBatimentFilter("Tous")}
        >Tous</button>
        {BATIMENTS.map(b => (
          <button
            key={b}
            className={`px-3 py-1 rounded ${batimentFilter === b ? "bg-blue-700 text-white" : "bg-white text-blue-700 border border-blue-200"} font-semibold shadow text-sm sm:text-base`}
            onClick={() => setBatimentFilter(b)}
          >{b}</button>
        ))}
      </div>

      <ul className="w-full max-w-6xl space-y-4 mb-8">
        {BATIMENTS.filter(b => grouped[b].length > 0).length === 0 && (
          <li className="text-gray-500 italic text-center">Aucun copropriétaire enregistré.</li>
        )}
        {BATIMENTS.map(bat => (
          grouped[bat].length > 0 && (
            <li key={bat}>
              <div className="mb-2">
                <span className="text-md sm:text-xl font-bold text-blue-700">{bat}</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-center">
                {grouped[bat].map((u, i) => (
                  <li
                    key={u._id || i}
                    className="bg-white/90 w-full mx-auto p-3 sm:p-5 rounded-xl border border-blue-100 text-gray-900 shadow"
                  >
                    <div className="flex flex-wrap gap-8 mb-1">
                      <div>
                        <span className="font-medium text-blue-700">Nom :</span> <span className="font-semibold">{u.nom}</span>
                        <span className="ml-8 font-medium text-blue-700">Prénom :</span> <span className="font-semibold">{u.prenom}</span>
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className="font-medium text-blue-700">Email :</span> <span>{u.email}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-medium text-blue-700">Téléphone :</span> <span>{u.telephone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Bâtiment :</span> <span>{u.batiment}</span>
                      <span className="ml-8 font-medium text-blue-700">Appartement :</span> <span>{u.appartement}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          )
        ))}
      </ul>
      <button
        onClick={() => router.back()}
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-sm sm:text-base"
      >Retour</button>
    </main>
  );
}
