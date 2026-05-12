import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {

    if (!name || !email || !password || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // ✅ Save to localStorage first (normalized email)
    const normalizedEmail = email.trim().toLowerCase();

    localStorage.setItem("email", normalizedEmail);
    localStorage.setItem("password", password);
    localStorage.setItem("name", name.trim());
    localStorage.setItem("token", "logged-in");

    // ✅ Fire API in background (don't block signup on it)
    try {
      await fetch(
        "https://k7p23bz1zd.execute-api.ap-south-1.amazonaws.com/prod/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "signup",
            name: name.trim(),
            email: normalizedEmail,
            password,
          }),
        }
      );
    } catch (error) {
      console.error("API signup error (non-blocking):", error);
    }

    setMessage("Signup successful ✅");

    setTimeout(() => {
      navigate("/converter");
    }, 1500);

  };

  return (
    <div style={styles.root}>

      <div style={styles.left}>

        <h2 style={styles.brand}>
          Audio
          <span style={styles.brandAccent}>
            Reader
          </span>
        </h2>

        <p style={styles.tagline}>
          Convert any text into natural, realistic speech.
        </p>

        <div style={styles.leftCard}>

          <div style={styles.leftItem}>
            🎧 AI Powered Audio
          </div>

          <div style={styles.leftItem}>
            ☁ AWS Cloud Based
          </div>

          <div style={styles.leftItem}>
            ⚡ Fast Conversion
          </div>

        </div>

      </div>

      <div style={styles.right}>

        <div style={styles.formWrap}>

          <h1 style={styles.title}>
            Create account
          </h1>

          <p style={styles.subtitle}>
            Start converting text to audio
          </p>

          <div style={styles.inputWrap}>

            <label style={styles.inputLabel}>
              Name
            </label>

            <input
              type="text"
              placeholder="Your name"
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

          </div>

          <div style={styles.inputWrap}>

            <label style={styles.inputLabel}>
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

          <div style={styles.inputWrap}>

            <label style={styles.inputLabel}>
              Password
            </label>

            <div style={{ position: "relative" }}>

              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 16,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </span>

            </div>

          </div>

          <div style={styles.inputWrap}>

            <label style={styles.inputLabel}>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

          </div>

          {message && (
            <p style={styles.message}>
              {message}
            </p>
          )}

          <button
            style={styles.submit}
            onClick={handleSignup}
          >
            Create Account →
          </button>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Sign in
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

  message: {
    background: "#e8f7ee",
    color: "#1e7a46",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
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

export default Signup;