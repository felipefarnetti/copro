"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TodoArchives() {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    fetch("/api/todosyndic-archives")
      .then(res => res.json())
      .then(setTodos);
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 flex flex-col items-center py-8 px-2 w-full">
      <div className="w-full max-w-2xl bg-white/90 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-3">Archives des todos</h2>
        <ul className="space-y-2">
          {todos.length === 0 && <li className="text-gray-400 italic">Aucune tâche archivée.</li>}
          {todos.map((todo, idx) => (
            <li key={todo._id || idx} className="flex items-center gap-2">
              <span className={todo.done ? "line-through text-blue-600/70" : "text-gray-900"}>
                {todo.text}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {todo.createdAt ? new Date(todo.createdAt).toLocaleString() : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow"
          >
            Retour
          </button>
        </div>
      </div>
    </main>
  );
}
