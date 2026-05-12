import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={styles.root}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h2 style={styles.logo}>
          Audio<span style={styles.logoAccent}>Reader</span>
        </h2>
        <div style={styles.navBtns}>
          <Link to="/login">
            <button style={styles.btnGhost}>Login</button>
          </Link>
          <Link to="/signup">
            <button style={styles.btnFill}>Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.pill}>✦ Powered by AWS Polly</div>

        <h1 style={styles.h1}>
          Turn any text into
          <br />
          <em style={styles.h1Accent}>natural speech</em>
        </h1>

        <p style={styles.sub}>
          Convert notes, articles, and documents into realistic audio — in seconds.
        </p>

        <Link to="/signup">
          <button style={styles.cta}>Get Started →</button>
        </Link>

        {/* Feature cards */}
        <div style={styles.features}>
          {[
            { icon: "🎙️", title: "Multiple Voices", desc: "Choose from male, female & regional accents" },
            { icon: "📄", title: "File Upload",    desc: "Paste text or upload a document directly" },
            { icon: "⬇️", title: "Download Audio", desc: "Export your MP3 to listen anytime, anywhere" },
          ].map((f) => (
            <div key={f.title} style={styles.featCard}>
              <div style={styles.featIcon}>{f.icon}</div>
              <div style={styles.featTitle}>{f.title}</div>
              <div style={styles.featDesc}>{f.desc}</div>
            </div>
          ))}
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
  logoAccent: { color: "#c4622d" },
  navBtns: { display: "flex", gap: 12 },
  btnGhost: {
    padding: "9px 20px",
    borderRadius: 8,
    border: "0.5px solid #1a1a1a",
    background: "transparent",
    color: "#1a1a1a",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnFill: {
    padding: "9px 20px",
    borderRadius: 8,
    border: "none",
    background: "#c4622d",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "100px 24px 80px",
    textAlign: "center",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#fbeee8",
    color: "#9e4720",
    fontSize: 12,
    fontWeight: 500,
    padding: "5px 14px",
    borderRadius: 999,
    border: "0.5px solid #f0c4a8",
    marginBottom: 28,
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },
  h1: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 68,
    lineHeight: 1.05,
    color: "#1a1a1a",
    marginBottom: 22,
    letterSpacing: "-2px",
    maxWidth: 680,
    fontWeight: 400,
  },
  h1Accent: { color: "#c4622d", fontStyle: "italic" },
  sub: {
    fontSize: 17,
    color: "#6b6660",
    lineHeight: "1.7",
    maxWidth: 500,
    marginBottom: 40,
    fontWeight: 300,
  },
  cta: {
    padding: "15px 36px",
    borderRadius: 10,
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.2px",
  },
  features: {
    display: "flex",
    gap: 12,
    marginTop: 56,
    maxWidth: 640,
  },
  featCard: {
    flex: 1,
    background: "#fefefe",
    border: "0.5px solid #e8e4dc",
    borderRadius: 12,
    padding: 20,
    textAlign: "left",
  },
  featIcon: { fontSize: 22, marginBottom: 10 },
  featTitle: { fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 },
  featDesc: { fontSize: 12, color: "#9a9590", lineHeight: "1.6" },
};

export default Home;