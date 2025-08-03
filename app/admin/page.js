"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [desc, setDesc] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "copro" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") { router.push("/dashboard"); return; }
    setUser(payload);

    fetchProblems(token);
    fetchUsers(token);
  }, []);

  const fetchProblems = (token) => {
    fetch("/api/problems", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setProblems(data || []));
  };

  const fetchUsers = (token) => {
    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsers(data || []));
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/problems/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProblems(token);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    const token = localStorage.getItem("token");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newUser)
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Utilisateur ajouté !");
      setNewUser({ email: "", password: "", role: "copro" });
      fetchUsers(token);
    } else {
      setError(data.error || "Erreur");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded">Déconnexion</button>
      </div>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Problèmes signalés</h2>
        <ul className="space-y-2 mb-4">
          {problems.length === 0 && <li>Aucun problème signalé.</li>}
          {problems.map(p => (
            <li key={p._id} className="bg-gray-50 p-3 rounded border flex justify-between items-center">
              <div>
                <b>{p.email}</b> ({new Date(p.createdAt).toLocaleString()})<br />
                {p.description}
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded ml-4"
                onClick={() => handleDelete(p._id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Utilisateurs</h2>
        <ul className="space-y-1 mb-4">
          {users.length === 0 && <li>Aucun utilisateur trouvé.</li>}
          {users.map(u => (
            <li key={u._id} className="border p-2 rounded">{u.email} ({u.role})</li>
          ))}
        </ul>
        <form onSubmit={handleAddUser} className="bg-white shadow p-4 rounded w-full max-w-md">
          <h3 className="mb-2 font-semibold">Ajouter un utilisateur</h3>
          <input type="email" required placeholder="Email"
            className="input mb-2 w-full"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          <input type="password" required placeholder="Mot de passe"
            className="input mb-2 w-full"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          <select
            className="input mb-2 w-full"
            value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="copro">Copropriétaire</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn w-full">Ajouter</button>
          {msg && <p className="text-green-600 mt-2">{msg}</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      </section>
    </main>
  );
}
