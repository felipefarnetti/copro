import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Modifier un problème (description ET/OU statut)
export async function PUT(req, { params }) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { description, statut } = await req.json();
    const client = await clientPromise;
    const db = client.db("copro");
    const query = { _id: new ObjectId(params.id) };
    if (user.role !== "admin") query.userId = user.id;

    let update = {};
    if (description) update.description = description;
    if (statut) {
      update.statut = statut;
      if (statut === "solutionné") update.dateResolution = new Date();
      if (statut === "pris en compte") update.datePrisEnCompte = new Date();
      if (statut === "supprimé") update.dateSuppression = new Date();
    }
    const result = await db.collection("problems").updateOne(query, { $set: update });
    if (result.matchedCount === 0) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Supprimer (archive) un problème (optionnel)
// Tu peux garder cette route si tu veux permettre une suppression depuis Postman ou admin très avancé, mais plus besoin côté utilisateur ! 
export async function DELETE(req, { params }) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("copro");
    const query = { _id: new ObjectId(params.id) };
    if (user.role !== "admin") query.userId = user.id;

    // Met à jour le statut et la date de suppression
    const result = await db.collection("problems").updateOne(
      query,
      { $set: { statut: "supprimé", dateSuppression: new Date() } }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
