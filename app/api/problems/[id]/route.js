import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Modifier un problème (description ET/OU statut)
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

    // 🔍 Récupérer le problème avant modification
    const problem = await db.collection("problems").findOne(query);
    if (!problem) return NextResponse.json({ error: "Problème introuvable" }, { status: 404 });

    let update = {};
    if (description) update.description = description;
    if (statut) {
      update.statut = statut;
      if (statut === "solutionné") update.dateResolution = new Date();
      if (statut === "pris en compte") update.datePrisEnCompte = new Date();
      if (statut === "supprimé") update.dateSuppression = new Date();
    }

    // ✅ Mise à jour
    const result = await db.collection("problems").updateOne(query, { $set: update });
    if (result.matchedCount === 0) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    // 🔔 Notification unique avec le corps du message
    if (statut && ["pris en compte", "solutionné"].includes(statut)) {
      const capitalized =
        statut.charAt(0).toUpperCase() + statut.slice(1).replace("e", "é");

      try {
        // Notification contenant le titre et le message du problème
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `🔔 Problème ${capitalized}`,
            message: problem.description // corps du message
          })
        });
      } catch (e) {
        console.error("Erreur notification statut :", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


// Supprimer (archive) un problème
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
