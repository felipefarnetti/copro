import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("copro");
    const userDb = await db.collection("users").findOne(
      { email: user.email },
      { projection: { password: 0 } }
    );
    if (!userDb) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    return NextResponse.json(userDb);
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
