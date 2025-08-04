"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProblemCard from "../../components/ProblemCard";
import Link from "next/link";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [newUser, setNewUser] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    batiment: "",
    appartement: "",
    role: "copro",
    password: "",
  });
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

  // Créer un utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setShowModal(false);
      setNewUser({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        batiment: "",
        appartement: "",
        role: "copro",
        password: "",
      });
      setSuccessMsg("Utilisateur créé avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      const error = await res.json();
      setSuccessMsg(error.error || "Erreur lors de la création.");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Problèmes
  const handleSetStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    let body = { statut: status };
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

  // Ajoute ces fonctions pour naviguer vers les nouvelles pages
  const goToTodoSyndic = () => router.push("/admin/todo-syndic");
  const goToActivites = () => router.push("/admin/activites");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-6 sm:py-10 px-1 sm:px-2 w-full">
      <div className="w-full max-w-3xl">
        <div className="flex flex-wrap gap-2 justify-between items-center mb-8">
          <h1 className="text-lg sm:text-3xl font-bold text-white drop-shadow">Dashboard Admin</h1>
          <div className="flex flex-wrap gap-2">
            {/* BOUTON CREER UTILISATEUR */}
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1 rounded-xl shadow text-xs sm:text-base"
              onClick={() => setShowModal(true)}
            >Créer utilisateur</button>
            {/* NOUVEAU bouton pour todo/syndic */}
            <button
              className="bg-yellow-100 text-yellow-900 font-semibold px-3 py-1 rounded-xl shadow hover:bg-yellow-200 text-xs sm:text-base"
              onClick={goToTodoSyndic}
            >ToDo / Syndic</button>
            {/* NOUVEAU bouton pour activités */}
            <button
              className="bg-green-100 text-green-900 font-semibold px-3 py-1 rounded-xl shadow hover:bg-green-200 text-xs sm:text-base"
              onClick={goToActivites}
            >Activités copropriété</button>
            <Link href="/admin/annuaire" className="bg-blue-100 text-blue-900 font-semibold px-3 py-1 rounded-xl shadow hover:bg-blue-200 text-xs sm:text-base">Annuaire</Link>
            <Link href="/admin/archive" className="bg-blue-100 text-blue-900 font-semibold px-3 py-1 rounded-xl shadow hover:bg-blue-200 text-xs sm:text-base">Historique</Link>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1 rounded-xl shadow transition text-xs sm:text-base"
            >Déconnexion</button>
          </div>
        </div>
        {successMsg && (
          <div className="w-full max-w-3xl mb-4 mx-auto text-center">
            <div className="inline-block bg-green-50 text-green-800 border border-green-300 rounded px-4 py-2 text-sm shadow">
              {successMsg}
            </div>
          </div>
        )}

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

      {/* Modale création utilisateur */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-3"
          >
            <h3 className="text-xl font-bold text-blue-800 mb-2">Créer un utilisateur</h3>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Prénom"
                className="w-1/2 border rounded px-2 py-1"
                value={newUser.prenom}
                onChange={e => setNewUser(u => ({ ...u, prenom: e.target.value }))}
              />
              <input
                type="text"
                required
                placeholder="Nom"
                className="w-1/2 border rounded px-2 py-1"
                value={newUser.nom}
                onChange={e => setNewUser(u => ({ ...u, nom: e.target.value }))}
              />
            </div>
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full border rounded px-2 py-1"
              value={newUser.email}
              onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
            />
            <input
              type="tel"
              placeholder="Téléphone"
              className="w-full border rounded px-2 py-1"
              value={newUser.telephone}
              onChange={e => setNewUser(u => ({ ...u, telephone: e.target.value }))}
            />
            <div className="flex gap-2">
              <select
                required
                className="w-1/2 border rounded px-2 py-1"
                value={newUser.batiment}
                onChange={e => setNewUser(u => ({ ...u, batiment: e.target.value }))}
              >
                <option value="">Bâtiment...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="H">H</option>
              </select>
              <input
                type="text"
                placeholder="Appartement"
                className="w-1/2 border rounded px-2 py-1"
                value={newUser.appartement}
                onChange={e => setNewUser(u => ({ ...u, appartement: e.target.value }))}
              />
            </div>
            <select
              className="w-full border rounded px-2 py-1"
              value={newUser.role}
              onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
            >
              <option value="copro">Copropriétaire</option>
              <option value="admin">Administrateur</option>
            </select>
            <input
              type="password"
              required
              placeholder="Mot de passe"
              className="w-full border rounded px-2 py-1"
              value={newUser.password}
              onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowModal(false)}
              >Annuler</button>
              <button
                type="submit"
                className="px-4 py-1 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800"
              >Créer</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
