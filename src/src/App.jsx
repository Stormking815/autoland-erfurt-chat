import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Du bist ein freundlicher KI-Kundenservice-Agent für Autoland AG – Niederlassung Erfurt, Deutschlands größtem Autodiscounter.

Unternehmensdaten:
- Adresse: Heinrich-Credner-Str. 4, 99087 Erfurt
- Telefon: +49 361 73939555
- E-Mail: erfurt@autoland.de
- Website: autoland.de/autoland-niederlassungen/erfurt

Öffnungszeiten:
- Mo.–Fr.: 09:00–20:00 Uhr
- Sa.: 09:00–18:00 Uhr
- So. & Feiertage: Autoschau von 09:00–18:00 Uhr (kein Verkauf/keine Beratung)

Leistungen:
- Neu-, Jahres- und Gebrauchtwagenkauf (alle Marken: VW, Audi, BMW, Mercedes-Benz, Ford, Opel, Skoda u.v.m.)
- Hybrid- und Elektrofahrzeuge
- Flexible Finanzierung ab 0 % Anzahlung, Laufzeiten bis 120 Monate
- Kostenlose Probefahrten
- Inzahlungnahme des alten Fahrzeugs
- Garantiepakete
- Fahrzeugzulassung – alles aus einer Hand

Besonderheiten:
- Neuwagen bis zu 30 % günstiger als UVP
- Jahreswagen bis zu 40 % günstiger als UVP
- Bestpreisgarantie auf Gebrauchtwagen
- Sofortige Verfügbarkeit – keine Lieferzeit
- Über 15.000 Fahrzeuge bundesweit, 37 Standorte

Deine Aufgabe:
- Beantworte Kundenfragen freundlich, kurz und klar auf Deutsch
- Beziehe dich nur auf die oben genannten Informationen
- Bei komplexen Anliegen (Kaufvertrag, spezifische Fahrzeugverfügbarkeit etc.) verweise höflich ans Team: Telefon +49 361 73939555 oder erfurt@autoland.de
- Mache niemals Preisversprechen für konkrete Fahrzeuge
- Antworte immer in du-Form, es sei denn der Kunde wünscht Sie-Form.`;

const QUICK_QUESTIONS = [
  "Wann habt ihr geöffnet?",
  "Welche Marken führt ihr?",
  "Wie funktioniert die Finanzierung?",
  "Kann ich mein Auto in Zahlung geben?",
];

export default function AutolandChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hallo! 👋 Ich bin der virtuelle Assistent von Autoland Erfurt. Wie kann ich dir heute helfen?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply = data?.content?.[0]?.text || "Entschuldigung, ich konnte keine Antwort generieren.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Es gab einen Verbindungsfehler. Bitte versuche es erneut oder ruf uns an: +49 361 73939555",
      }]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!isOpen) {
    return (
      <div style={styles.fab} onClick={() => setIsOpen(true)}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="2" ry="2" />
              <circle cx="12" cy="16" r="1" fill="white" />
            </svg>
          </div>
          <div>
            <div style={styles.headerTitle}>Autoland Erfurt</div>
            <div style={styles.headerSub}>
              <span style={styles.onlineDot} /> Online – Jetzt chatten
            </div>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
      </div>

      <div style={styles.messages}>
        <div style={styles.infoBar}>
          <span>📍 Heinrich-Credner-Str. 4, Erfurt &nbsp;|&nbsp; 📞 0361 73939555</span>
        </div>

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {msg.role === "assistant" && <div style={styles.avatar}>A</div>}
            <div style={msg.role === "user" ? styles.bubbleUser : styles.bubbleBot}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={styles.avatar}>A</div>
            <div style={styles.bubbleBot}>
              <span style={styles.dot} />
              <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
              <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={styles.quickWrap}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button key={i} style={styles.quickBtn} onClick={() => sendMessage(q)}>{q}</button>
          ))}
        </div>
      )}

      <div style={styles.inputRow}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Deine Frage..."
          rows={1}
          style={styles.textarea}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ ...styles.sendBtn, opacity: !input.trim() || loading ? 0.5 : 1 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" />
          </svg>
        </button>
      </div>

      <div style={styles.footer}>Powered by KI-Agent · autoland.de</div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: { width: 390, maxWidth: "100vw", height: 620, display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Segoe UI', sans-serif", background: "#fff", animation: "fadeIn 0.3s ease" },
  header: { background: "linear-gradient(135deg, #cc0000 0%, #e80000 100%)", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)" },
  headerTitle: { color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: 0.3 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#7fff7f", boxShadow: "0 0 6px #7fff7f" },
  closeBtn: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  infoBar: { background: "#fff5f5", borderLeft: "3px solid #cc0000", padding: "8px 12px", fontSize: 11, color: "#888", borderRadius: 6, margin: "0 0 10px 0" },
  messages: { flex: 1, overflowY: "auto", padding: "14px 16px 0", background: "#fafafa" },
  avatar: { width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #cc0000, #e80000)", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, alignSelf: "flex-end" },
  bubbleBot: { background: "#fff", border: "1px solid #eee", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", fontSize: 14, color: "#222", maxWidth: "75%", lineHeight: 1.5, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  bubbleUser: { background: "linear-gradient(135deg, #cc0000, #e80000)", borderRadius: "18px 18px 4px 18px", padding: "10px 14px", fontSize: 14, color: "#fff", maxWidth: "75%", lineHeight: 1.5 },
  dot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#cc0000", animation: "bounce 1.2s infinite", margin: "0 2px" },
  quickWrap: { display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 16px", background: "#fafafa", borderTop: "1px solid #f0f0f0" },
  quickBtn: { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#cc0000", cursor: "pointer", fontWeight: 500 },
  inputRow: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fff", borderTop: "1px solid #f0f0f0" },
  textarea: { flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 20, padding: "9px 14px", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.4, color: "#222", background: "#fafafa" },
  sendBtn: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #cc0000, #e80000)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  footer: { textAlign: "center", fontSize: 11, color: "#bbb", padding: "6px", background: "#fff" },
  fab: { width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg, #cc0000, #e80000)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(204,0,0,0.4)", animation: "fadeIn 0.3s ease" },
};
