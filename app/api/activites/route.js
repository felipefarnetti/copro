import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET
export async function GET() {
  const client = await clientPromise;
  const db = client.db("copro");
  const activites = await db.collection("activites")
    .find({})
    .sort({ date: -1, heureDebut: -1 })
    .toArray();
  return NextResponse.json(activites);
}

// POST
export async function POST(req) {
  const body = await req.json();
  if (!body.description || !body.date || !body.heureDebut || !body.heureFin) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("copro");
  const activite = {
    description: body.description,
    date: new Date(body.date),      // <-- STOCKE BIEN EN Date !
    heureDebut: body.heureDebut,
    heureFin: body.heureFin,
    createdAt: new Date(),
  };
  const result = await db.collection("activites").insertOne(activite);
  return NextResponse.json({ ...activite, _id: result.insertedId });
}
