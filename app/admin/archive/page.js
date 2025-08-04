"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUTS = [
  { key: "tous", label: "Tous" },
  { key: "pris en compte", label: "Pris en compte" },
  { key: "solutionné", label: "Solutionnés" },
  { key: "supprimé", label: "Supprimés" }
];

export default function Archive() {
  const [problems, setProblems] = useState([]);
  const [statutFilter, setStatutFilter] = useState("tous");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    fetch("/api/problems", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setProblems);
  }, []);

  let filtered = problems.filter(p => 
    ["solutionné", "supprimé", "pris en compte"].includes(p.statut)
  );
  if (statutFilter !== "tous") {
    filtered = filtered.filter(p => p.statut === statutFilter);
  }
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <main className="p-2 sm:p-8 max-w-4xl w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-800 text-center">
        Historique complet des problèmes
      </h1>

      {/* Filtres Statut */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {STATUTS.map(s => (
          <button
            key={s.key}
            className={`px-3 py-1 rounded ${statutFilter === s.key ? "bg-blue-700 text-white" : "bg-white text-blue-700 border border-blue-200"} font-semibold shadow text-sm sm:text-base`}
            onClick={() => setStatutFilter(s.key)}
          >{s.label}</button>
        ))}
      </div>

      <ul className="space-y-4 mb-8">
        {filtered.length === 0 && (
          <li className="text-gray-500 italic text-center">
            Aucun problème archivé pour ce filtre.
          </li>
        )}
        {filtered.map((p, i) => (
          <li
            key={p._id || i}
            className="bg-white/90 w-full mx-auto max-w-3xl p-3 sm:p-5 rounded-xl border border-blue-100 text-gray-900 shadow"
          >
            <div className="mb-1">
              <span className="font-medium text-blue-700">Signalé le :</span>{" "}
              <span className="text-gray-700">{new Date(p.createdAt).toLocaleString()}</span>
            </div>
            <div className="mb-1">
              <span className="font-medium text-blue-700">Description :</span>{" "}
              <span className="text-gray-800">{p.description}</span>
            </div>
            <div className="mb-1 flex items-center">
              <span className="font-medium text-blue-700 mr-2">Statut :</span>
              <span
                className={
                  "capitalize font-bold px-2 py-0.5 rounded text-sm " +
                  (p.statut === "supprimé"
                    ? "text-red-700 bg-red-50 border border-red-200"
                    : p.statut === "solutionné"
                    ? "text-green-700 bg-green-50 border border-green-200"
                    : p.statut === "pris en compte"
                    ? "text-yellow-700 bg-yellow-50 border border-yellow-200"
                    : "text-blue-700 bg-blue-50 border border-blue-200")
                }
              >
                {p.statut || "non défini"}
              </span>
              {p.statut === "solutionné" && p.dateResolution && (
                <span className="ml-3 text-xs text-green-700">
                  Solutionné le : {new Date(p.dateResolution).toLocaleString()}
                </span>
              )}
              {p.statut === "supprimé" && p.dateSuppression && (
                <span className="ml-3 text-xs text-red-700">
                  Supprimé le : {new Date(p.dateSuppression).toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Par copropriétaire : {p.email || "inconnu"}
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={() => router.back()}
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-sm sm:text-base mt-4"
      >Retour</button>
    </main>
  );
}
