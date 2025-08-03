"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Archive() {
  const [problems, setProblems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    fetch("/api/problems", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setProblems);
  }, []);

  const archivedProblems = problems.filter(
    p => p.statut === "solutionné" || p.statut === "supprimé"
  );

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Historique complet des problèmes</h1>
      <ul className="space-y-4">
        {archivedProblems.length === 0 && (
          <li className="text-gray-500 italic">Aucun problème archivé.</li>
        )}
        {archivedProblems.map((p, i) => (
          <li key={p._id || i} className="bg-white p-4 rounded-lg border border-blue-100 text-gray-900 shadow">
            <div>
              <span className="font-medium text-blue-700">Signalé le :</span>{" "}
              <span className="text-gray-700">{new Date(p.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Description :</span>{" "}
              <span className="text-gray-800">{p.description}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Statut :</span>{" "}
              <span className="capitalize">{p.statut || "non défini"}</span>
              {p.statut === "solutionné" && p.dateResolution && (
                <>
                  <span className="ml-4 font-medium text-green-700">Solutionné le :</span>{" "}
                  <span className="text-green-700">{new Date(p.dateResolution).toLocaleString()}</span>
                </>
              )}
              {p.statut === "supprimé" && p.dateSuppression && (
                <>
                  <span className="ml-4 font-medium text-red-700">Supprimé le :</span>{" "}
                  <span className="text-red-700">{new Date(p.dateSuppression).toLocaleString()}</span>
                </>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-400">
                Par copropriétaire : {p.email || "inconnu"}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={() => router.back()}
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow mt-8"
      >Retour</button>
    </main>
  );
}
