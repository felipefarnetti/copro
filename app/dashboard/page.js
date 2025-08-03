"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProblemCard from "../../components/ProblemCard";
import dayjs from "dayjs";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const [desc, setDesc] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [infos, setInfos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser(payload);

    fetchProblems(token);
    fetch("/api/infos")
      .then(res => res.json())
      .then(setInfos);
  }, []);

  const fetchProblems = (token) => {
    fetch("/api/problems", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProblems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const token = localStorage.getItem("token");
    const res = await fetch("/api/problems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
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

  // Filtrage : n'affiche pas les supprimés et solutionnés de +3 mois
  const now = dayjs();
  const myProblems = problems.filter(p => {
    if (p.userId !== user?.id) return false;
    if (p.statut === "supprimé") return false;
    if (
      p.statut === "solutionné" &&
      p.dateResolution &&
      dayjs(now).diff(dayjs(p.dateResolution), "month") >= 3
    ) {
      return false;
    }
    return true;
  });

  const otherProblems = problems.filter(p =>
    p.userId !== user?.id &&
    p.statut !== "supprimé" &&
    !(p.statut === "solutionné" && p.dateResolution && dayjs(now).diff(dayjs(p.dateResolution), "month") >= 3)
  );

  return (
    <main className="p-8 max-w-2xl mx-auto">
<div className="flex justify-between mb-4 items-center">
    <h1 className="text-lg sm:text-2xl font-bold">Bienvenue, {user?.email}</h1>
    <button
      onClick={handleLogout}
      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1 rounded-xl shadow transition text-sm sm:text-base"
    >
      Déconnexion
    </button>
  </div>
      <form onSubmit={handleSubmit} className="mb-8">
        <label className="block mb-2 font-medium">Décrire un nouveau problème :</label>
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
      <h2 className="text-xl mb-2 font-semibold">Mes problèmes signalés</h2>
      <ul className="space-y-2">
        {myProblems.length === 0 && (
          <li className="text-gray-500">Aucun problème signalé.</li>
        )}
        {myProblems.map((p, i) => (
          <ProblemCard key={p._id || i} problem={p} refreshProblems={() => fetchProblems(localStorage.getItem("token"))} />
        ))}
      </ul>
      <hr className="my-6 border-gray-500" />
      <h2 className="text-xl mb-2 font-semibold">Problèmes signalés par les autres</h2>
      <ul className="space-y-2">
        {otherProblems.length === 0 && (
          <li className="text-gray-500 italic">Aucun problème signalé par les autres copropriétaires.</li>
        )}
        {otherProblems.map((p, i) => (
          <li key={p._id || i} className="bg-gray-50 p-4 rounded-lg border border-blue-100 text-gray-900 shadow">
            <span className="font-medium text-blue-700">Signalé le :</span>{" "}
            <span className="text-gray-700">{new Date(p.createdAt).toLocaleString()}</span>
            <div>
              <span className="font-medium text-blue-700">Description :</span>{" "}
              <span className="text-gray-800">{p.description}</span>
            </div>
            <span className="text-xs text-gray-500 block mt-1">
              Statut : {p.statut === "nouveau"
                ? "Nouveau"
                : p.statut === "pris en compte"
                ? "Pris en compte"
                : p.statut === "solutionné"
                ? "Solutionné"
                : p.statut}
            </span>
            <span className="text-xs text-gray-400 block">Par copropriétaire : Utilisateur</span>
          </li>
        ))}
      </ul>
      <h2 className="text-xl mt-6 mb-2 font-semibold">Infos générales</h2>
      <ul className="mb-8">
        {infos.length === 0 && <li>Aucune information.</li>}
        {infos.map(info => (
          <li key={info._id} className="border p-3 mb-2 rounded bg-gray-50">
            <b>{info.titre}</b>
            <p>{info.contenu}</p>
            <span className="text-xs text-gray-500">{new Date(info.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
