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

  // clé de tri : la date “la plus pertinente” selon le statut
  const getSortDate = (p) => {
    if (p.statut === "supprimé" && p.dateSuppression) return new Date(p.dateSuppression);
    if (p.statut === "solutionné" && p.dateResolution) return new Date(p.dateResolution);
    if (p.updatedAt) return new Date(p.updatedAt);
    return new Date(p.createdAt);
  };

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
    filtered.sort((a, b) => getSortDate(b) - getSortDate(a));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-6 sm:py-10 px-1 sm:px-2 w-full">
      <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow mb-3">
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

      {/* Responsive grille centrée */}
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="flex justify-center w-full">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-auto">
            {filtered.length === 0 && (
              <li className="col-span-full text-gray-500 italic text-center">
                Aucun problème archivé pour ce filtre.
              </li>
            )}
            {filtered.map((p, i) => (
              <li
                key={p._id || i}
                className="bg-white/90 w-full max-w-xl mx-auto p-3 sm:p-5 rounded-xl border border-blue-100 text-gray-900 shadow"
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
  Par habitant:{" "}
  {p.user
    ? `${p.user.nom} ${p.user.prenom}`
    : "inconnu"}
</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={() => router.back()}
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-sm sm:text-base mt-4"
      >Retour</button>
    </main>
  );
}
