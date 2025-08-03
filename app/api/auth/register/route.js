import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const admin = verifyToken(token);
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { email, password, role } = await req.json();
    if (!email || !password || !role) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    if (!["admin", "copro"].includes(role)) return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const userExist = await db.collection("users").findOne({ email });
    if (userExist) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({ email, password: hashed, role });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
