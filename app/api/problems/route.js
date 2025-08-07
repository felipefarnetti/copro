import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

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
    // Récupère tous les problèmes
    const problems = await db.collection("problems").find({}).sort({ createdAt: -1 }).toArray();

    // Récupère tous les users concernés
    const userIds = problems.map(p => p.userId).filter(Boolean);
    const usersData = userIds.length
      ? await db.collection("users").find({ _id: { $in: userIds.map(id => typeof id === "string" ? new ObjectId(id) : id) } }).toArray()
      : [];
    const usersMap = Object.fromEntries(usersData.map(u => [u._id.toString(), u]));

    // Ajoute les infos user (nom, prenom) à chaque problème
    const problemsWithUser = problems.map(p => {
      const user = usersMap[p.userId?.toString()];
      return {
        ...p,
        user: user
          ? { prenom: user.prenom, nom: user.nom, email: user.email }
          : null
      };
    });

    return NextResponse.json(problemsWithUser);
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
      userId: typeof user.id === "string" ? new ObjectId(user.id) : user.id,
      email: user.email,
      description,
      createdAt: new Date(),
      statut: "nouveau",
      dateStatut: new Date()
    };
    const result = await db.collection("problems").insertOne(doc);
    doc._id = result.insertedId;

    // 🔔 Envoi de notification OneSignal via API interne
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "🆕 Nouveau problème signalé",
          message: doc.description
        })
      });
    } catch (e) {
      console.error("Erreur lors de l'envoi de la notification :", e);
    }

    return NextResponse.json(doc); // ✅ bonne réponse ici
  } catch (e) {
    console.error("Erreur POST /api/problems:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
