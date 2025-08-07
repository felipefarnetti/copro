"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProblemCard from "../../components/ProblemCard";
import OneSignalMobileOnly from "../../components/OneSignalMobileOnly";
import NotifStatusIcon from "../../components/NotifStatusIcon";
import dayjs from "dayjs";

function diffHeures(hDebut, hFin) {
  if (!hDebut || !hFin) return 0;
  const [h1, m1] = hDebut.split(":").map(Number);
  const [h2, m2] = hFin.split(":").map(Number);
  return ((h2 + m2 / 60) - (h1 + m1 / 60)) > 0 ? ((h2 + m2 / 60) - (h1 + m1 / 60)) : 0;
}

function ActivitesPublic() {
  const [activites, setActivites] = useState([]);

  useEffect(() => {
    fetch("/api/activites")
      .then(res => res.json())
      .then(data => setActivites(data));
  }, []);

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
    <div className="bg-white/90 border border-blue-100 p-5 mt-2 rounded-xl">
      <h2 className="text-lg font-semibold mb-3 text-blue-700">Activités réalisées dans la copropriété</h2>
      <div className="mb-3 font-bold">
        Total des heures ce mois : <span className="text-blue-800">{totalHeuresMois.toFixed(2)} h</span> / Année : <span className="text-blue-800">{totalHeuresAnnee.toFixed(2)} h</span>
      </div>
      <ul className="space-y-2">
        {activites.length === 0 && <li className="text-gray-400 italic">Aucune activité pour l’instant.</li>}
        {activites.map((a, i) => (
          <li key={a._id || i} className="border-l-4 border-blue-500 pl-3 py-1">
            <div className="font-medium">{a.description}</div>
            <div className="text-xs text-gray-600">
              {a.date ? new Date(a.date).toLocaleDateString() : ""}
              {a.heureDebut && a.heureFin
                ? ` | ${a.heureDebut} → ${a.heureFin} (${diffHeures(a.heureDebut, a.heureFin).toFixed(2)} h)`
                : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const [desc, setDesc] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [infos, setInfos] = useState([]);
  const router = useRouter();

  const fetchProblems = (token) => {
    fetch("/api/problems", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProblems);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role === "admin") {
      router.push("/admin");
      return;
    }
    setUser(payload);

    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.prenom && data.nom) {
          setUser(u => ({ ...u, prenom: data.prenom, nom: data.nom }));
        }
      });

    fetchProblems(token);
    fetch("/api/infos").then(res => res.json()).then(setInfos);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const token = localStorage.getItem("token");
    const res = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ description: desc })
    });
    const data = await res.json();
    if (res.ok) {
      setProblems([data, ...problems]);
      setDesc("");
      setSuccess("Problème signalé !");
    } else {
      setError(data.error || "Erreur");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const now = dayjs();
  const myProblems = problems.filter(p => {
    if (p.userId !== user?.id) return false;
    if (p.statut === "supprimé") return false;
    if (p.statut === "solutionné" && p.dateResolution && dayjs(now).diff(dayjs(p.dateResolution), "month") >= 3) return false;
    return true;
  });
  const otherProblems = problems.filter(p =>
    p.userId !== user?.id &&
    p.statut !== "supprimé" &&
    !(p.statut === "solutionné" && p.dateResolution && dayjs(now).diff(dayjs(p.dateResolution), "month") >= 3)
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-6 sm:py-10 px-1 sm:px-2 w-full">
      <OneSignalMobileOnly />

      <div className="flex justify-between mb-4 items-center w-full max-w-4xl">
        <h1 className="text-lg text-white sm:text-2xl font-bold">
          Bienvenue, {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email}
          <span className="block text-sm font-normal text-white">{user?.email}</span>
        </h1>
        <div className="flex justify-between items-center w-full">
          <h1 className="text-lg sm:text-2xl font-bold text-white">...</h1>
          <div className="flex items-center gap-3">
            <NotifStatusIcon />
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1 rounded-xl shadow transition text-xs sm:text-base"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <label className="block text-white mb-2 font-medium">Décrire un nouveau problème :</label>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full border p-2 rounded mb-2 bg-white text-gray-900"
          required
        />
        <button className="bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base">Envoyer</button>
        {success && <p className="text-green-600 mt-2">{success}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      <h2 className="text-xl text-white mb-2 font-semibold">Mes problèmes signalés</h2>
      <ul className="space-y-2">
        {myProblems.length === 0 && (
          <li className="text-gray-500">Aucun problème signalé.</li>
        )}
        {myProblems.map((p, i) => (
          <ProblemCard key={p._id || i} problem={p} refreshProblems={() => fetchProblems(localStorage.getItem("token"))} />
        ))}
      </ul>

      <hr className="my-6 border-gray-500" />
      <h2 className="text-xl text-white mb-2 font-semibold">Problèmes signalés par les autres</h2>
      <ul className="space-y-2">
        {otherProblems.length === 0 && (
          <li className="text-gray-500 italic">Aucun problème signalé par les autres habitants.</li>
        )}
        {otherProblems.map((p, i) => (
          <li key={p._id || i} className="bg-gray-50 p-4 rounded-lg border border-blue-100 text-gray-900 shadow">
            <span className="font-medium text-blue-700">Signalé le :</span>{" "}
            <span className="text-gray-700">{new Date(p.createdAt).toLocaleString()}</span>
            <div>
              <span className="font-medium text-blue-700">Description :</span>{" "}
              <span className="text-gray-800">{p.description}</span>
            </div>
            <span
              className={
                "capitalize font-bold px-2 py-0.5 rounded text-xs mt-1 inline-block " +
                (p.statut === "supprimé"
                  ? "text-red-700 bg-red-50 border border-red-200"
                  : p.statut === "solutionné"
                  ? "text-green-700 bg-green-50 border border-green-200"
                  : p.statut === "pris en compte"
                  ? "text-yellow-700 bg-yellow-50 border border-yellow-200"
                  : "text-blue-700 bg-blue-50 border border-blue-200")
              }
            >
              {p.statut === "nouveau"
                ? "Nouveau"
                : p.statut === "pris en compte"
                ? "Pris en compte"
                : p.statut === "solutionné"
                ? "Solutionné"
                : p.statut}
            </span>
            <span className="text-xs text-gray-400 block">Par Habitant: Utilisateur</span>
          </li>
        ))}
      </ul>

      <h2 className="text-xl text-white mt-8 mb-2 font-semibold">Infos générales</h2>
      <ActivitesPublic />
    </main>
  );
}
