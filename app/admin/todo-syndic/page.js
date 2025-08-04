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

  // Sauvegarde locale des todos (non partagé entre admins, sauf backend)
  useEffect(() => {
    const saved = localStorage.getItem("admin_todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("admin_todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (input.trim()) setTodos([...todos, { text: input, done: false }]);
    setInput("");
  };
  const toggleTodo = idx => setTodos(todos.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  const removeTodo = idx => setTodos(todos.filter((_, i) => i !== idx));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-8 px-2 w-full">
      <div className="w-full max-w-5xl bg-white/90 rounded-xl shadow-lg p-6 flex flex-col lg:flex-row gap-8">
        {/* Colonne gauche : TODO */}
        <section className="lg:w-1/2 w-full">
          <h2 className="text-xl font-bold text-blue-800 mb-3">ToDo interne</h2>
          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={input}
              placeholder="Ajouter une tâche"
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="px-3 py-1 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {todos.length === 0 && <li className="text-gray-400 italic">Aucune tâche.</li>}
            {todos.map((todo, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(idx)}
                  className="accent-blue-600"
                />
                <span className={todo.done ? "line-through text-gray-400" : ""}>{todo.text}</span>
                <button onClick={() => removeTodo(idx)} className="ml-2 text-xs text-red-600 hover:underline">suppr.</button>
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
