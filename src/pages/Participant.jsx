import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Gift, Clock, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Participant() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Por favor, ingresa tu código de acceso");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/participant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: code.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setCode("");
  };

  return (
    <div>
      {!result ? (
        <Card className="auth-card">
          <button onClick={() => navigate("/")} className="back-btn">
            <ArrowLeft />
            <span>Volver</span>
          </button>

          <div className="auth-header">
            <div className="auth-icon purple">
              <svg viewBox="0 0 100 100" width="56" height="56">
                <circle cx="50" cy="50" r="45" fill="#7c3aed"/>
                <rect x="25" y="45" width="50" height="35" rx="4" fill="#fbbf24"/>
                <rect x="20" y="38" width="60" height="12" rx="3" fill="#f59e0b"/>
                <rect x="45" y="38" width="10" height="42" fill="#ef4444"/>
                <ellipse cx="40" cy="32" rx="10" ry="8" fill="#ef4444"/>
                <ellipse cx="60" cy="32" rx="10" ry="8" fill="#ef4444"/>
                <circle cx="50" cy="35" r="6" fill="#dc2626"/>
              </svg>
            </div>
            <h2>¡Hola, amigo!</h2>
            <p>Ingresa el código que te compartió el organizador</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Código de Acceso"
              type="text"
              icon={Ticket}
              placeholder="Ej: ABC12345"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Ver mi Asignación
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="result-card">
          <button onClick={reset} className="back-btn">
            <ArrowLeft />
            <span>Usar otro código</span>
          </button>

          <div className="result-header">
            <div className="result-icon">
              <svg viewBox="0 0 100 100" width="64" height="64">
                <circle cx="50" cy="50" r="45" fill="#059669"/>
                <path d="M30 55 L45 70 L75 35" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="25" cy="25" r="4" fill="#fbbf24"/>
                <circle cx="80" cy="30" r="3" fill="#fbbf24"/>
                <circle cx="75" cy="75" r="3" fill="#fbbf24"/>
                <circle cx="20" cy="70" r="2" fill="#fbbf24"/>
              </svg>
            </div>
            <h2>¡Hola, {result.name}!</h2>
          </div>

          {result.drawCompleted && result.assignment ? (
            <div className="assignment-box">
              <div className="assignment-decoration">
                <Sparkles />
                <Sparkles />
                <Sparkles />
                <Sparkles />
              </div>
              <div className="assignment-content">
                <p className="assignment-label">Tu amigo secreto es...</p>
                <p className="assignment-name">{result.assignment}</p>
                <div className="assignment-badge">
                  <Gift />
                  <span>¡Prepárale un lindo regalo!</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="waiting-box">
              <Clock />
              <p>El sorteo aún no se ha realizado</p>
              <p>Vuelve más tarde cuando el organizador complete el sorteo.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
