"use client";
import { useState } from "react";

export default function ProblemForm({ onAdd }) {
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (desc.length < 4) {
      setError("Description trop courte");
      return;
    }
    await onAdd(desc);
    setDesc("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label className="block mb-2">Décrire un problème :</label>
      <textarea
        className="border rounded w-full p-2 mb-2"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        required
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button className="bg-blue-700 text-white px-4 py-2 rounded">Envoyer</button>
    </form>
  );
}
