import { NextResponse } from "next/server";

type PredictResponse = { label: string; confidence: number };

// POST /api/ingest
export async function POST(req: Request) {
  try {
    const { text } = await req.json() as { text?: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const mlUrl = process.env.ML_API_URL!;
    const resp = await fetch(mlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!resp.ok) {
      return NextResponse.json({ error: "ML service error" }, { status: 502 });
    }

    const data = (await resp.json()) as PredictResponse;

    const action_preview =
      data.label === "bill" ? "Suggest: add bill reminder to Calendar" :
      data.label === "bank_txn" ? "Suggest: log transaction to Google Sheet" :
      data.label === "subscription" ? "Suggest: update Subscriptions Tracker" :
      data.label === "shipment" ? "Suggest: generate tracking link" :
      "Suggest: review manually";

    return NextResponse.json({
      message_id: crypto.randomUUID(),
      predicted_label: data.label,
      confidence_score: data.confidence,
      action_preview,
    });
  } catch (err) {
    console.error("INGEST ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
