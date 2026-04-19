import { useEffect, useState } from "react";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // ── Si ya hay token, redirigir directo al admin ──
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) window.location.href = "/Admin";
  }, []);


  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("https://api.wffperuchapter.page/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
          password: password,
        }),
      });

      if (!res.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await res.json();

      // 🔐 guardar token
      localStorage.setItem("token", data.access_token);

      // 🚀 redirigir al admin
      window.location.href = "/Admin";
    } catch (err) {
      console.error(err);
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Top accent bar */}
        <div style={styles.accentBar} />

        {/* Logo */}
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            marginBottom: "1.25rem",
          }}
        >
          <img
            src="https://www.wffperuchapter.page/img/WFFPeru.webp"
            alt=""
            style={{ height: "50px" }}
          />
        </div>

        <h1 style={styles.title}>Login</h1>
        <p style={styles.subtitle}></p>

        {/* Admin Usuario */}
        <label style={styles.label} htmlFor="username">
          Usuario
        </label>
        <div style={styles.inputWrap}>
          <EmailIcon />
          <input
            id="username"
            type="text"
            placeholder="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            style={styles.input}
            onFocus={(e) => {
              e.target.style.borderColor = "#EF9F27";
              e.target.style.boxShadow = "0 0 0 3px #FAC77533";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#FAC77566";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Password */}
        <label style={styles.label} htmlFor="password">
          Contraseña
        </label>
        <div style={styles.inputWrap}>
          <LockIcon />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            onFocus={(e) => {
              e.target.style.borderColor = "#EF9F27";
              e.target.style.boxShadow = "0 0 0 3px #FAC77533";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#FAC77566";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Remember + Forgot */}
        <div style={styles.row}></div>

        {/* Login button */}
        <button onClick={handleSubmit} style={styles.btnLogin}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function EmailIcon() {
  return (
    <svg
      style={iconStyle}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#BA7517"
      strokeWidth="1.5"
    >
      <path d="M2.5 5.5h15v10h-15V5.5z" strokeLinejoin="round" />
      <path d="M2.5 5.5l7.5 6 7.5-6" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      style={iconStyle}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#BA7517"
      strokeWidth="1.5"
    >
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#EF9F27"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#D85A30"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#BA7517"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#412402"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  width: 16,
  height: 16,
  pointerEvents: "none",
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBF5",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    border: "0.5px solid #FAC77533",
    padding: "2.5rem 2rem 2rem",
    position: "relative",
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "linear-gradient(90deg, #FAC775, #EF9F27, #D85A30)",
    borderRadius: "20px 20px 0 0",
  },
  logoRing: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    backgroundColor: "#FAEEDA",
    border: "2px solid #FAC775",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.25rem",
  },
  logoInner: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 500,
    color: "#412402",
    margin: "0 0 4px",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#854F0B",
    margin: "0 0 2rem",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "#633806",
    marginBottom: 6,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  inputWrap: {
    position: "relative",
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    height: 44,
    padding: "0 12px 0 40px",
    border: "1.5px solid #FAC77566",
    borderRadius: 10,
    fontSize: 14,
    color: "#412402",
    backgroundColor: "#FFFDF8",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  remember: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#633806",
    cursor: "pointer",
    userSelect: "none",
  },
  forgot: {
    fontSize: 12,
    color: "#EF9F27",
    textDecoration: "none",
    fontWeight: 500,
  },
  btnLogin: {
    width: "100%",
    height: 46,
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(135deg, #EF9F27 0%, #D85A30 100%)",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    letterSpacing: "0.02em",
    marginBottom: "1.25rem",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "1.25rem",
  },
  dividerLine: {
    flex: 1,
    height: "0.5px",
    backgroundColor: "#FAC77566",
    display: "block",
  },
  dividerText: {
    fontSize: 12,
    color: "#854F0B",
    margin: 0,
  },
  btnGoogle: {
    width: "100%",
    height: 42,
    border: "1.5px solid #FAC77566",
    borderRadius: 10,
    backgroundColor: "#FFFDF8",
    color: "#633806",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: "1.5rem",
  },
  signupText: {
    textAlign: "center",
    fontSize: 13,
    color: "#854F0B",
    margin: 0,
  },
  signupLink: {
    color: "#EF9F27",
    fontWeight: 500,
    textDecoration: "none",
  },
};
