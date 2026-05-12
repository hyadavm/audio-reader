import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    const savedName = localStorage.getItem("name"); // ✅ read saved name

    if (
      email.trim().toLowerCase() === savedEmail &&
      password === savedPassword
    ) {
      localStorage.setItem("token", "logged-in");
      localStorage.setItem("name", savedName || ""); // ✅ re-save name on login
      alert("Login successful");
      navigate("/converter");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div style={styles.root}>

      <div style={styles.left}>
        <h2 style={styles.brand}>
          Audio<span style={styles.brandAccent}>Reader</span>
        </h2>
        <p style={styles.tagline}>
          Welcome back to your audio workspace.
        </p>
        <div style={styles.leftCard}>
          <div style={styles.leftItem}>🎧 AI Powered Audio</div>
          <div style={styles.leftItem}>☁ AWS Cloud Based</div>
          <div style={styles.leftItem}>⚡ Fast Conversion</div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formWrap}>

          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.subtitle}>Continue your experience</p>

          <div style={styles.inputWrap}>
            <label style={styles.inputLabel}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.inputWrap}>
            <label style={styles.inputLabel}>Password</label>
            <input
              type="password"
              placeholder="Your password"
              autoComplete="new-password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button style={styles.submit} onClick={handleLogin}>
            Login →
          </button>

          <p style={styles.footer}>
            Don't have an account?{" "}
            <Link to="/signup" style={styles.link}>
              Create account
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    flex: 1,
    background: "#1a1a1a",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "60px 48px",
    textAlign: "center",
    gap: 24,
  },
  brand: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 32,
    color: "#fefefe",
    fontWeight: 400,
    marginBottom: 8,
  },
  brandAccent: {
    color: "#e8925e",
  },
  tagline: {
    fontSize: 15,
    color: "#bdb8b1",
    fontWeight: 300,
    maxWidth: 260,
    lineHeight: "1.7",
  },
  leftCard: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  leftItem: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "16px 20px",
    borderRadius: 14,
    color: "#fefefe",
    fontSize: 15,
    backdropFilter: "blur(10px)",
    width: 260,
    textAlign: "left",
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fefefe",
    padding: "60px 48px",
  },
  formWrap: {
    width: "100%",
    maxWidth: 420,
  },
  title: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 42,
    color: "#1a1a1a",
    fontWeight: 400,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9a9590",
    fontWeight: 300,
    marginBottom: 32,
  },
  inputWrap: {
    marginBottom: 18,
  },
  inputLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 500,
    color: "#6b6660",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 10,
    border: "0.5px solid #e0dbd2",
    background: "#faf9f6",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    color: "#1a1a1a",
    outline: "none",
    boxSizing: "border-box",
  },
  submit: {
    width: "100%",
    padding: 16,
    borderRadius: 10,
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 10,
  },
  footer: {
    fontSize: 14,
    color: "#9a9590",
    textAlign: "center",
    marginTop: 24,
  },
  link: {
    color: "#c4622d",
    fontWeight: 500,
    textDecoration: "none",
  },
};

export default Login;