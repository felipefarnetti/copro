import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET: Liste toutes les infos
export async function GET(req) {
  const client = await clientPromise;
  const db = client.db();
  const infos = await db.collection("infos").find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json(infos);
}

// POST: Crée une info (admin only)
export async function POST(req) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const token = auth.split(" ")[1];
  const user = verifyToken(token);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { titre, contenu } = await req.json();
  if (!titre || !contenu) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const doc = { titre, contenu, createdAt: new Date() };
  const result = await db.collection("infos").insertOne(doc);
  doc._id = result.insertedId;
  return NextResponse.json(doc);
}
