"use client";
import { useState } from "react";

export default function ProblemCard({ problem, refreshProblems, isAdmin, onSetStatus }) {
  const [editMode, setEditMode] = useState(false);
  const [editDesc, setEditDesc] = useState(problem.description);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/problems/${problem._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description: editDesc }),
    });
    setSaving(false);
    if (res.ok) {
      setEditMode(false);
      refreshProblems(token);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    await fetch(`/api/problems/${problem._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ statut: "supprimé", dateSuppression: new Date() }),
    });
    refreshProblems(token);
  };

  // Pour admin: changer le statut
  const handleStatus = async (statut) => {
    if (onSetStatus) {
      let extra = {};
      if (statut === "solutionné") extra.dateResolution = new Date();
      if (statut === "supprimé") extra.dateSuppression = new Date();
      onSetStatus(problem._id, statut, extra);
    }
  };

  return (
    <li className="bg-white p-4 rounded-lg border border-blue-100 text-gray-900 shadow mb-3">
      <div>
        <span className="font-medium text-blue-700">Signalé le :</span>{" "}
        <span className="text-gray-700">{new Date(problem.createdAt).toLocaleString()}</span>
      </div>
      <div>
        <span className="font-medium text-blue-700">Description :</span>{" "}
        {editMode ? (
          <textarea
            className="input-custom w-full my-2"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
          />
        ) : (
          <span className="text-gray-800">{problem.description}</span>
        )}
      </div>
      <span className="text-xs text-gray-500 mt-2 block">
        Statut : {problem.statut === "nouveau"
          ? "Nouveau"
          : problem.statut === "pris en compte"
          ? "Pris en compte"
          : problem.statut === "solutionné"
          ? "Solutionné"
          : problem.statut === "supprimé"
          ? "Supprimé"
          : "Non défini"}
      </span>
      {isAdmin && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {problem.statut !== "pris en compte" && problem.statut !== "solutionné" && problem.statut !== "supprimé" && (
            <button
              className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-blue-400 hover:bg-blue-500 text-white text-xs sm:text-base"
              onClick={() => handleStatus("pris en compte")}
            >
              Pris en compte
            </button>
          )}
          {problem.statut !== "solutionné" && problem.statut !== "supprimé" && (
            <button
              className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs sm:text-base"
              onClick={() => handleStatus("solutionné")}
            >
              Solutionné
            </button>
          )}
          {problem.statut !== "supprimé" && (
            <button
              className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs sm:text-base"
              onClick={() => setShowModal(true)}
            >
              Supprimer
            </button>
          )}
        </div>
      )}
      {!isAdmin && problem.statut !== "supprimé" && (
        <div className="flex gap-2 mt-2">
          {!editMode ? (
            <>
              <button
                className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-black text-xs sm:text-base"
                onClick={() => setEditMode(true)}
              >
                Modifier
              </button>
              <button
                className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs sm:text-base"
                onClick={() => setShowModal(true)}
              >
                Supprimer
              </button>
            </>
          ) : (
            <>
              <button
                className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-base"
                disabled={saving}
                onClick={handleSave}
              >
                Enregistrer
              </button>
              <button
                className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-gray-300 hover:bg-gray-400 text-xs sm:text-base"
                disabled={saving}
                onClick={() => setEditMode(false)}
              >
                Annuler
              </button>
            </>
          )}
        </div>
      )}
      {/* Modal de suppression */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xs flex flex-col items-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">Confirmer la suppression</h3>
            <p className="mb-4 text-center text-gray-700">
              Voulez-vous vraiment supprimer ce problème ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded text-xs sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  await handleDelete();
                  setShowModal(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs sm:text-base"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
