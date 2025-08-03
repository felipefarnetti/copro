"use client";
import { useRouter } from "next/navigation";

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <nav className="w-full bg-blue-700 text-white p-3 flex justify-between items-center mb-6">
      <span className="font-semibold text-lg">Copropriété</span>
      <div className="flex items-center gap-4">
        {user?.email && <span>{user.email} ({user.role})</span>}
        <button className="bg-white text-blue-700 rounded px-3 py-1" onClick={handleLogout}>Déconnexion</button>
      </div>
    </nav>
  );
}
