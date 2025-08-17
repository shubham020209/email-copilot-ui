"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const classify = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const connectGmail = async () => {
    // incremental consent to add gmail.readonly later
    await signIn("google", {
      callbackUrl: "/",
      scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
      prompt: "consent",
      access_type: "offline",
    });
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Email Life-Admin Copilot (MVP)</h1>

      <div style={{ margin: "12px 0" }}>
        {status === "loading" && <span>Checking session…</span>}

        {session ? (
          <>
            <div>Signed in as <b>{session.user?.email}</b></div>
            <button onClick={() => signOut()} style={{ marginRight: 8 }}>Sign out</button>
            <button onClick={connectGmail}>Connect Gmail</button>
          </>
        ) : (
          <button onClick={() => signIn("google")}>Sign in with Google</button>
        )}
      </div>

      <hr style={{ margin: "24px 0" }} />

      <h2>Quick test: paste email text → classify</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste an email subject + body here…"
        rows={6}
        style={{ width: "100%", padding: 8 }}
      />
      <div style={{ marginTop: 8 }}>
        <button disabled={!text.trim() || loading} onClick={classify}>
          {loading ? "Classifying…" : "Classify"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <div><b>Label:</b> {result.predicted_label}</div>
          <div><b>Confidence:</b> {(result.confidence_score * 100).toFixed(1)}%</div>
          <div><b>Action preview:</b> {result.action_preview}</div>
          <div><b>Message ID:</b> {result.message_id}</div>
        </div>
      )}
    </main>
  );
}

