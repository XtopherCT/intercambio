import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Gift, Clock, PartyPopper, Sparkles } from "lucide-react";
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
      toast.error("Ingresa tu codigo de acceso");
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
              <Gift />
            </div>
            <h2>Ver mi Amigo Secreto</h2>
            <p>Ingresa el codigo que te compartio el organizador</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Codigo de Acceso"
              type="text"
              icon={Ticket}
              placeholder="ABC12345"
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
              Ver mi Asignacion
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="result-card">
          <button onClick={reset} className="back-btn">
            <ArrowLeft />
            <span>Usar otro codigo</span>
          </button>

          <div className="result-header">
            <div className="result-icon">
              <PartyPopper />
            </div>
            <h2>Hola, {result.name}!</h2>
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
                <p className="assignment-label">Tu amigo secreto es</p>
                <p className="assignment-name">{result.assignment}</p>
                <div className="assignment-badge">
                  <Gift />
                  <span>Prepara un gran regalo!</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="waiting-box">
              <Clock />
              <p>El sorteo aun no se ha realizado</p>
              <p>Vuelve mas tarde cuando el organizador complete el sorteo.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
