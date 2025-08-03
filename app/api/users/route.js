import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("copro"); // <-- nom de ta base !
    const users = await db.collection("users")
      .find({}, { projection: { password: 0 } }) // on cache les passwords
      .sort({ email: 1 })
      .toArray();

    return NextResponse.json(users);
  } catch (e) {
    console.error("Erreur GET /api/users:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
