"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProblemCard from "../../components/ProblemCard";
import Link from "next/link";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") { router.push("/dashboard"); return; }
    setUser(payload);
    fetchProblems(token);
  }, []);

  const fetchProblems = (token) => {
    fetch("/api/problems", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setProblems(data || []));
  };

  // Fonction pour changer le statut
  const handleSetStatus = async (id, status) => {
  const token = localStorage.getItem("token");
  let body = { statut: status }; // harmonise status/statut
  if (status === "solutionné") body.dateResolution = new Date();
  if (status === "supprimé") body.dateSuppression = new Date();
  await fetch(`/api/problems/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  fetchProblems(token);
};


  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
   <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-6 sm:py-10 px-1 sm:px-2 w-full">
  <div className="w-full max-w-3xl">
    <div className="flex flex-wrap gap-2 justify-between items-center mb-8">
      <h1 className="text-lg sm:text-3xl font-bold text-white drop-shadow">Dashboard Admin</h1>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/annuaire" className="bg-blue-100 text-blue-900 font-semibold px-3 py-1 rounded-xl shadow hover:bg-blue-200 text-xs sm:text-base">Annuaire</Link>
        <Link href="/admin/archive" className="bg-blue-100 text-blue-900 font-semibold px-3 py-1 rounded-xl shadow hover:bg-blue-200 text-xs sm:text-base">Historique</Link>
        <button
          onClick={handleLogout}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1 rounded-xl shadow transition text-xs sm:text-base"
        >Déconnexion</button>
      </div>
    </div>   

        {/* Problèmes */}
        <section className="mb-10 bg-white/90 p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Tous les problèmes signalés</h2>
          <ul className="space-y-2 mb-4">
            {problems.length === 0 && <li className="text-gray-500">Aucun problème signalé.</li>}
            {problems.map(p => (
              <ProblemCard
                key={p._id}
                problem={p}
                refreshProblems={() => fetchProblems(localStorage.getItem("token"))}
                isAdmin
                onSetStatus={handleSetStatus}
              />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
