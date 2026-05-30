"use client";

import { useState } from "react";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("backendtest@nexusops.ai");
  const [password, setPassword] = useState("Nexus@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setMessage("");

      const endpoint =
        mode === "signin"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || data.message || "Request failed");
        return;
      }

      if (mode === "signup") {
        setMessage("Account created. Confirm user in Cognito, then sign in.");
        setMode("signin");
        return;
      }

      localStorage.setItem("nexus_access_token", data.tokens.AccessToken);
      localStorage.setItem("nexus_id_token", data.tokens.IdToken);
      localStorage.setItem("nexus_refresh_token", data.tokens.RefreshToken);

      window.location.href = "/dashboard";
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="nx-auth-page">
      <section className="nx-auth-shell">
        <div className="nx-auth-hero">
          <div className="nx-orb">NX</div>

          <p className="nx-auth-kicker">AI Infrastructure Command Platform</p>

          <h1>
            Operate cloud systems
            <span> before they fail.</span>
          </h1>

          <p className="nx-auth-copy">
            Realtime incident intelligence, AWS Lambda microservices, Cognito
            security, and live response signals in one command surface.
          </p>

          <div className="nx-auth-stats">
            <div>
              <strong>3</strong>
              <span>Lambda Services</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>WebSocket Feed</span>
            </div>
            <div>
              <strong>JWT</strong>
              <span>Secure Access</span>
            </div>
          </div>
        </div>

        <div className="nx-auth-card">
          <div className="nx-auth-tabs">
            <button
              className={mode === "signin" ? "active" : ""}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>

            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <h2>{mode === "signin" ? "Welcome back" : "Create account"}</h2>

          <p className="nx-muted">
            {mode === "signin"
              ? "Enter your operator credentials to access NexusOps X."
              : "Create a new Cognito-backed operator identity."}
          </p>

          <label>Email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@nexusops.ai"
          />

          <label>Password</label>
          <div className="nx-password-box">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
            />

            <button onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="nx-auth-submit" onClick={submit} disabled={loading}>
            {loading
              ? "Processing..."
              : mode === "signin"
              ? "Enter Command Center"
              : "Create NexusOps Account"}
          </button>

          {message && <p className="nx-auth-message">{message}</p>}

          <p className="nx-auth-switch">
            {mode === "signin" ? "New operator?" : "Already registered?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}