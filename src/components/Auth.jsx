import { useState } from "react";
import { supabase } from "../lib/supabase";
import { LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function Auth({ onGuest }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="background-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>
              <span className="header-gradient">Task Planner</span>
            </h1>
            <p className="auth-subtitle">
              {isLogin ? "Welcome back! Sign in to continue" : "Create an account to get started"}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? "active" : ""}`}
              onClick={() => { setIsLogin(true); setError(""); }}
            >
              <LogIn size={16} />
              Sign In
            </button>
            <button
              className={`auth-tab ${!isLogin ? "active" : ""}`}
              onClick={() => { setIsLogin(false); setError(""); }}
            >
              <UserPlus size={16} />
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="auth-field">
              <div className="auth-field-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-icon">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <Loader2 size={18} className="spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button type="button" className="auth-guest-btn" onClick={onGuest}>
              Continue as Guest
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
