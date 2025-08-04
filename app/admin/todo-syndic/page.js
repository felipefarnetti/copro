"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SYNDIC_TOPICS = [
  "Question sur l’appel de fonds trimestriel",
  "Point sur le nettoyage / entretien",
  "Relance devis travaux toiture",
  "Point AG prochaine",
  "Problème technique à signaler au syndic",
  "Autre sujet..."
];

export default function TodoSyndicPage() {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Charge les todos non archivés depuis l'API
  useEffect(() => {
    fetch("/api/todosyndic")
      .then(res => res.json())
      .then(setTodos);
  }, []);

  // Ajouter un todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const res = await fetch("/api/todosyndic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    if (res.ok) {
      const nouv = await res.json();
      setTodos([nouv, ...todos]);
      setInput("");
    }
    setLoading(false);
  };

  // Toggle done
  const toggleTodo = async (idx) => {
    const todo = todos[idx];
    const res = await fetch(`/api/todosyndic/${todo._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done })
    });
    if (res.ok) {
      const maj = await res.json();
      setTodos(todos => todos.map((t, i) => i === idx ? maj : t));
    }
  };

  // Supprimer
  const removeTodo = async (idx) => {
    const todo = todos[idx];
    if (!window.confirm("Supprimer cette tâche ?")) return;
    const res = await fetch(`/api/todosyndic/${todo._id}`, { method: "DELETE" });
    if (res.ok) setTodos(todos => todos.filter((_, i) => i !== idx));
  };

  // Archiver
  const archiveTodo = async (idx) => {
    const todo = todos[idx];
    const res = await fetch(`/api/todosyndic/${todo._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true })
    });
    if (res.ok) setTodos(todos => todos.filter((_, i) => i !== idx));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-8 px-2 w-full">
      <div className="w-full max-w-5xl bg-white/90 rounded-xl shadow-lg p-6 flex flex-col lg:flex-row gap-8">
        {/* Colonne gauche : TODO */}
       <section className="lg:w-1/2 w-full">
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-xl font-bold text-blue-800">ToDo interne</h2>
    <button
      onClick={() => router.push("/admin/todo-archives")}
      className="px-3 py-1 rounded bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500"
    >
      Voir archives
    </button>
  </div>
  <form onSubmit={addTodo} className="flex gap-2 mb-4">
    <input
      className="flex-1 border border-blue-200 bg-white text-gray-900 rounded px-2 py-1"
      value={input}
      placeholder="Ajouter une tâche"
      onChange={e => setInput(e.target.value)}
      disabled={loading}
    />
    <button type="submit" className="px-3 py-1 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800" disabled={loading}>Ajouter</button>
  </form>
 <ul className="space-y-2">
  {todos.length === 0 && (
    <li className="text-gray-400 italic">Aucune tâche.</li>
  )}
  {todos.map((todo, idx) => (
    <li key={idx} className="flex items-center">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggleTodo(idx)}
        className="accent-blue-600 mr-2"
      />
      <span className={`flex-1 ${todo.done ? "line-through text-gray-500" : "text-gray-900"}`}>
        {todo.text}
      </span>
      <div className="flex gap-2 ml-2">
        <button
          onClick={() => archiveTodo(idx)}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded font-semibold text-xs shadow"
        >
          arch.
        </button>
        <button
          onClick={() => removeTodo(idx)}
          className="bg-red-100 hover:bg-red-300 text-red-700 px-2 py-0.5 rounded font-semibold text-xs shadow"
        >
          suppr.
        </button>
      </div>
    </li>
  ))}
</ul>
         
        </section>
        {/* Colonne droite : sujets syndic */}
        <section className="lg:w-1/2 w-full">
          <h2 className="text-xl font-bold text-blue-800 mb-3">Sujets liés au Syndic externe</h2>
          <ul className="list-disc list-inside space-y-1">
            {SYNDIC_TOPICS.map((topic, i) => (
              <li key={i} className="text-gray-800">{topic}</li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              onClick={() => router.back()}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow"
            >Retour</button>
          </div>
        </section>
      </div>
    </main>
  );
}
