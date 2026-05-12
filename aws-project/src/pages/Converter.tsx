import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const VOICE_OPTIONS = [
  { label: "🇬🇧 English (UK)", lang: "en-GB" },
  { label: "🇮🇳 Indian English", lang: "en-IN" },
  { label: "🇦🇺 Australian English", lang: "en-AU" },
  { label: "🇮🇪 Irish English", lang: "en-IE" },
];

type Status = "idle" | "loading" | "ready";
type DlState = "idle" | "done";

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const tryGet = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        cachedVoices = v;
        resolve(v);
        return true;
      }
      return false;
    };

    if (tryGet()) return;

    window.speechSynthesis.addEventListener("voiceschanged", function handler() {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      tryGet();
    });

    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (tryGet() || attempts > 20) clearInterval(poll);
    }, 100);
  });
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string
): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang === lang && v.name.toLowerCase().startsWith("google")) ??
    voices.find((v) => v.lang === lang && !v.localService) ??
    voices.find((v) => v.lang === lang) ??
    // Fallback: match language prefix (e.g. en-IE → any en-*)
    voices.find((v) => v.lang.startsWith(lang.split("-")[0]))
  );
}

function Converter() {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [audioUrl, setAudioUrl] = useState("");
  const [dlState, setDlState] = useState<DlState>("idle");
  const [fileError, setFileError] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const userName =localStorage.getItem("name");
  const [voicesReady, setVoicesReady] = useState(cachedVoices.length > 0);

  const audioReady = status === "ready";
  const charCount = text.length;

  useEffect(() => {
    if (cachedVoices.length > 0) return;
    loadVoices().then(() => setVoicesReady(true));
  }, []);

  // FILE UPLOAD
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => setText((ev.target?.result as string) ?? "");
      reader.onerror = () => setFileError("Could not read TXT file.");
      reader.readAsText(file);
      return;
    }

    if (fileName.endsWith(".pdf")) {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        await import("pdfjs-dist/build/pdf.worker.min.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let extractedText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText +=
            content.items
              .map((item: any) => ("str" in item ? item.str : ""))
              .join(" ") + "\n";
        }
        setText(extractedText);
      } catch (err) {
        console.error(err);
        setFileError("Could not read PDF file.");
      }
      return;
    }

    setFileError("Unsupported file format.");
  };

  // CONVERT
  const handleConvert = async () => {
    if (!text.trim()) return;
    setStatus("loading");
    try {
      const response = await fetch(
        "https://k7p23bz1zd.execute-api.ap-south-1.amazonaws.com/prod/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );
      const data = await response.json();
      setAudioUrl(data.audioUrl);
      setStatus("ready");
    } catch (error) {
      console.error(error);
      alert("AWS API Error");
      setStatus("idle");
    }
  };

  // PLAY
  const handleTogglePlay = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const voices = cachedVoices.length > 0
      ? cachedVoices
      : window.speechSynthesis.getVoices();

    const targetLang = VOICE_OPTIONS[selectedVoice].lang;
    const chosenVoice = pickVoice(voices, targetLang);

    const speech = new SpeechSynthesisUtterance(text);

    if (chosenVoice) {
      speech.voice = chosenVoice;
      speech.lang = chosenVoice.lang;
    } else {
      speech.lang = targetLang;
    }

    speech.rate = speed;
    speech.onstart = () => setPlaying(true);
    speech.onend = () => setPlaying(false);
    speech.onerror = () => setPlaying(false);

    window.speechSynthesis.speak(speech);
  };

  // DOWNLOAD
  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDlState("done");
    setTimeout(() => {
      setDlState("idle");
    }, 2000);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.root}>

      <nav style={styles.nav}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <span style={styles.logo}>
            Audio<span style={styles.logoAccent}>Reader</span>
          </span>
        </Link>

        <div style={styles.navRight}>
          <div style={styles.userBox}>

  <div style={styles.avatar}>

    {userName?.charAt(0)}

  </div>

  <span style={styles.userName}>

    {userName}

  </span>

</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.wrap}>

        <h1 style={styles.heading}>Audio Converter</h1>
        <p style={styles.sub}>
          Paste your text or upload a file to generate speech
        </p>

        <div style={styles.card}>

          <label style={styles.label}>Your Text</label>

          <textarea
            rows={7}
            placeholder="Paste your article, notes, or any text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
          />

          <p style={styles.charCount}>
            {charCount.toLocaleString()} character{charCount !== 1 ? "s" : ""}
          </p>

          {fileError && <p style={styles.errText}>{fileError}</p>}

          <div style={styles.row}>
            <label style={styles.uploadBtn}>
              <input
                type="file"
                accept=".txt,.pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              📎 Upload file
            </label>

            <select
              style={styles.select}
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(Number(e.target.value))}
            >
              {VOICE_OPTIONS.map((opt, i) => (
                <option key={i} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.speedRow}>
            <span style={styles.speedLabel}>Speed</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.speedValue}>{speed.toFixed(1)}×</span>
          </div>

          {!voicesReady && (
            <p style={styles.voiceHint}>Loading voices…</p>
          )}

          <button
            onClick={handleConvert}
            disabled={status === "loading" || !text.trim()}
            style={{
              ...styles.convertBtn,
              opacity: status === "loading" || !text.trim() ? 0.6 : 1,
              cursor:
                status === "loading" || !text.trim() ? "not-allowed" : "pointer",
            }}
          >
            {status === "loading" ? "Generating…" : "Convert to Audio"}
          </button>

          {audioReady && (
            <div style={styles.player}>
              <div style={styles.playerHeader}>
                <span style={styles.playerDot} />
                <span style={styles.playerLabel}>Audio ready</span>
              </div>

              <button onClick={handleTogglePlay} style={styles.playBtn}>
                {playing ? "⏸" : "▶"}
              </button>

              <button style={styles.downloadBtn} onClick={handleDownload}>
                {dlState === "done" ? "✅ Saved!" : "⬇ Download"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {

  root: {
    minHeight: "100vh",
    background: "#f7f5f0",
    fontFamily: "'DM Sans', sans-serif",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 56px",
    background: "#fefefe",
    borderBottom: "0.5px solid #e8e4dc",
  },

  logo: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 22,
    color: "#1a1a1a",
    fontWeight: 400,
  },

  logoAccent: {
    color: "#c4622d",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },

  navLabel: {
    fontSize: 13,
    color: "#9a9590",
    fontWeight: 300,
  },

  logoutBtn: {
    padding: "7px 18px",
    borderRadius: 8,
    border: "0.5px solid #e0dbd2",
    background: "transparent",
    color: "#6b6660",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
  },

  wrap: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "60px 24px",
  },

  heading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 42,
    color: "#1a1a1a",
    fontWeight: 400,
    letterSpacing: "-1px",
    marginBottom: 6,
  },

  sub: {
    fontSize: 14,
    color: "#9a9590",
    marginBottom: 36,
    fontWeight: 300,
  },

  card: {
    background: "#fefefe",
    border: "0.5px solid #e8e4dc",
    borderRadius: 16,
    padding: 32,
  },

  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 500,
    color: "#6b6660",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 8,
  },

  textarea: {
    width: "100%",
    padding: 16,
    borderRadius: 10,
    border: "0.5px solid #e0dbd2",
    background: "#faf9f6",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    resize: "none",
    color: "#1a1a1a",
    lineHeight: "1.6",
    outline: "none",
    boxSizing: "border-box",
  },

  charCount: {
    fontSize: 12,
    color: "#b0aca6",
    margin: "6px 0 0",
    textAlign: "right",
    fontWeight: 300,
  },

  errText: {
    fontSize: 12,
    color: "#c0392b",
    marginTop: 6,
  },

  voiceHint: {
    fontSize: 12,
    color: "#b0aca6",
    marginTop: 10,
    fontStyle: "italic",
  },

  row: {
    display: "flex",
    gap: 12,
    marginTop: 18,
  },

  uploadBtn: {
    flex: 1,
    padding: "11px 16px",
    borderRadius: 8,
    border: "0.5px dashed #c8c3ba",
    background: "#faf9f6",
    fontSize: 13,
    color: "#9a9590",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'DM Sans', sans-serif",
  },

  select: {
    flex: 1,
    padding: "11px 16px",
    borderRadius: 8,
    border: "0.5px solid #e0dbd2",
    background: "#faf9f6",
    fontSize: 14,
    color: "#1a1a1a",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  },

  speedRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
  },

  speedLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "#6b6660",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    whiteSpace: "nowrap" as const,
  },

  slider: {
    flex: 1,
    accentColor: "#c4622d",
  },

  speedValue: {
    fontSize: 13,
    fontWeight: 500,
    color: "#1a1a1a",
    minWidth: 32,
    textAlign: "right" as const,
  },

  convertBtn: {
    width: "100%",
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },

  player: {
    marginTop: 24,
    background: "#faf9f6",
    border: "0.5px solid #e0dbd2",
    borderRadius: 12,
    padding: 20,
  },

  playerHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  playerDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#4caf50",
    display: "inline-block",
  },

  playerLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#1a1a1a",
  },

  playBtn: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "#c4622d",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#fff",
  },
  
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#d96b00",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 18,
  },
  
  userName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1a1a1a",
  },

  downloadBtn: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: 8,
    border: "0.5px solid #c4622d",
    background: "transparent",
    color: "#c4622d",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 20,
  },

};

export default Converter;