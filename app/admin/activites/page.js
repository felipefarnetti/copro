"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Calcule la durée (en heures décimales) entre deux heures "HH:mm"
function diffHeures(hDebut, hFin) {
  if (!hDebut || !hFin) return 0;
  const [h1, m1] = hDebut.split(":").map(Number);
  const [h2, m2] = hFin.split(":").map(Number);
  return ((h2 + m2/60) - (h1 + m1/60)) > 0 ? ((h2 + m2/60) - (h1 + m1/60)) : 0;
}

export default function ActivitesPage() {
  const router = useRouter();
  const [activites, setActivites] = useState([]);
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // Récupère toutes les activités (descendantes)
  useEffect(() => {
    fetch("/api/activites")
      .then(res => res.json())
      .then(data => setActivites(data));
  }, []);

  // Ajout ou modification
  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    if (!desc.trim() || !date || !heureDebut || !heureFin) return;
    setLoading(true);

    if (editId) {
      // Modifier
      const res = await fetch(`/api/activites/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          date,
          heureDebut,
          heureFin,
        }),
      });
      if (res.ok) {
        const maj = await res.json();
        setActivites(activites =>
          activites.map(a => (a._id === editId ? maj : a))
        );
        setEditId(null);
        setDesc(""); setDate(""); setHeureDebut(""); setHeureFin("");
      }
    } else {
      // Ajouter
      const res = await fetch("/api/activites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          date,
          heureDebut,
          heureFin,
        }),
      });
      if (res.ok) {
        const nouvelle = await res.json();
        setActivites([nouvelle, ...activites]);
        setDesc(""); setDate(""); setHeureDebut(""); setHeureFin("");
      }
    }
    setLoading(false);
  };

  // Pré-remplir le formulaire pour modification
  const handleEdit = (a) => {
    setEditId(a._id);
    setDesc(a.description);
    setDate(a.date?.slice(0, 10) || "");
    setHeureDebut(a.heureDebut || "");
    setHeureFin(a.heureFin || "");
  };

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette activité ?")) return;
    const res = await fetch(`/api/activites/${id}`, { method: "DELETE" });
    if (res.ok) {
      setActivites(activites => activites.filter(a => a._id !== id));
      if (editId === id) { setEditId(null); setDesc(""); setDate(""); setHeureDebut(""); setHeureFin(""); }
    }
  };

  // Calculs des heures mois et année
  const now = new Date();
  const mois = now.getMonth();
  const annee = now.getFullYear();

  const totalHeuresMois = activites
    .filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === mois && d.getFullYear() === annee;
    })
    .reduce((sum, a) => sum + diffHeures(a.heureDebut, a.heureFin), 0);

  const totalHeuresAnnee = activites
    .filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === annee;
    })
    .reduce((sum, a) => sum + diffHeures(a.heureDebut, a.heureFin), 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-8 px-2 w-full">
      <div className="w-full max-w-2xl bg-white/90 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-3">
          {editId ? "Modifier" : "Ajouter"} une activit&eacute; &agrave; la copropri&eacute;t&eacute;
        </h2>
        <form onSubmit={handleAddOrEdit} className="flex flex-col gap-3 mb-6">
          <input
  className="border border-blue-200 bg-white text-gray-900 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={desc}
            required
            placeholder="Description de l&apos;activit&eacute;"
            onChange={e => setDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <input
  className="border border-blue-200 bg-white text-gray-900 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              type="date"
              value={date}
              required
              onChange={e => setDate(e.target.value)}
            />
            <input
  className="border border-blue-200 bg-white text-gray-900 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              type="time"
              required
              value={heureDebut}
              onChange={e => setHeureDebut(e.target.value)}
            />
            <span className="self-center text-xs text-gray-500">&rarr;</span>
            <input
  className="border border-blue-200 bg-white text-gray-900 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              type="time"
              required
              value={heureFin}
              onChange={e => setHeureFin(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-1 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:bg-gray-300"
              disabled={loading}
            >{editId ? "Enregistrer" : "Ajouter"}</button>
            {editId &&
              <button
                type="button"
                onClick={() => { setEditId(null); setDesc(""); setDate(""); setHeureDebut(""); setHeureFin(""); }}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold"
              >Annuler</button>
            }
          </div>
        </form>
        <div className="mb-4">
          <span className="font-bold text-blue-700">
            Total des heures du mois&nbsp;:
            <span className="ml-1">
              {totalHeuresMois.toLocaleString(undefined, { maximumFractionDigits: 2 })} h
            </span>
            <span className="mx-2 text-gray-400">/</span>
            Total des heures de l&apos;ann&eacute;e&nbsp;:
            <span className="ml-1">
              {totalHeuresAnnee.toLocaleString(undefined, { maximumFractionDigits: 2 })} h
            </span>
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-blue-700">
          Historique des activit&eacute;s
        </h3>
        <ul className="space-y-3">
          {activites.length === 0 && <li className="text-gray-400 italic">Aucune activit&eacute; enregistr&eacute;e.</li>}
          {activites.map((a, i) => (
            <li key={a._id || i} className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-gray-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium mb-1">{a.description}</div>
                <div className="text-xs text-gray-500">
                  {a.date ? new Date(a.date).toLocaleDateString() : ""}
                  {a.heureDebut && a.heureFin
                    ? ` | ${a.heureDebut} &rarr; ${a.heureFin} (${diffHeures(a.heureDebut, a.heureFin).toLocaleString(undefined, { maximumFractionDigits: 2 })} h)`
                    : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(a)}
                  className="text-blue-800 font-bold px-2 py-1 rounded hover:bg-blue-200"
                  title="Modifier"
                >✏️</button>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="text-red-600 font-bold px-2 py-1 rounded hover:bg-red-200"
                  title="Supprimer"
                >🗑️</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow"
          >Retour</button>
        </div>
      </div>
    </main>
  );
}
