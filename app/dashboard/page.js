"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    // Incidents
    fetch("/api/problems", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProblems(data.filter(p => p.userId === payload.id)))
      .catch(() => setProblems([]));

    // Infos générales
    fetch("/api/infos")
      .then(res => res.json())
      .then(setInfos)
      .catch(() => setInfos([]));
  }, []);

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

  if (!user) return <div>Chargement...</div>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Bienvenue, {user.email}</h1>
        <button aria-label="Déconnexion" onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded">Déconnexion</button>
      </div>
      <form onSubmit={handleSubmit} className="mb-8">
        <label className="block mb-2 font-medium">Décrire un nouveau problème :</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full border p-2 rounded mb-2" required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
        {success && <p className="text-green-600 mt-2">{success}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
      <h2 className="text-xl mb-2 font-semibold">Mes problèmes signalés</h2>
      <ul className="space-y-2">
        {problems.length === 0 && <li>Aucun problème signalé.</li>}
        {problems.map((p, i) => (
          <li key={p._id || i} className="bg-gray-50 p-3 rounded border">
            <span className="font-medium">Signalé le :</span> {new Date(p.createdAt).toLocaleString()}<br />
            <span className="font-medium">Description :</span> {p.description}
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
