import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const id = params.id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();
    await db.collection("problems").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT: admin (ou l’utilisateur qui a créé le problème) peut modifier/resoudre
export async function PUT(req, { params }) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const token = auth.split(" ")[1];
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { resolved } = await req.json();
  const id = params.id;
  const client = await clientPromise;
  const db = client.db();

  // On autorise l’admin ou l’auteur du problème
  const problem = await db.collection("problems").findOne({ _id: new ObjectId(id) });
  if (!problem) return NextResponse.json({ error: "Incident introuvable" }, { status: 404 });
  if (user.role !== "admin" && user.id !== problem.userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await db.collection("problems").updateOne(
    { _id: new ObjectId(id) },
    { $set: { resolved: !!resolved } }
  );
  return NextResponse.json({ success: true });
}