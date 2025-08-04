import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

// Liste tous les problèmes (front filtre pour chaque user/role)
export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("copro");
    const problems = await db.collection("problems").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(problems);
  } catch (e) {
    console.error("Erreur GET /api/problems:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Ajouter un problème (statut = "nouveau" par défaut)
export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { description } = await req.json();
    if (!description) return NextResponse.json({ error: "Description manquante" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("copro");
    const doc = {
      userId: user.id,
      email: user.email,
      description,
      createdAt: new Date(),
      statut: "nouveau",
      dateStatut: new Date()
    };
    const result = await db.collection("problems").insertOne(doc);
    doc._id = result.insertedId;
    return NextResponse.json(doc);
  } catch (e) {
    console.error("Erreur POST /api/problems:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
