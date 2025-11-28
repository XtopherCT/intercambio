import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/admin/status");
      const data = await res.json();
      setIsInitialized(data.initialized);
    } catch {
      toast.error("Error de conexion");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 4) {
      toast.error("La contrasena debe tener al menos 4 caracteres");
      return;
    }

    setLoading(true);

    try {
      if (!isInitialized) {
        const initRes = await fetch("/api/admin/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        });

        if (!initRes.ok) {
          const data = await initRes.json();
          throw new Error(data.error);
        }
        toast.success("Contrasena configurada correctamente");
      }

      const loginRes = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!loginRes.ok) {
        const data = await loginRes.json();
        throw new Error(data.error);
      }

      sessionStorage.setItem("adminPassword", password);
      navigate("/admin/panel");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isInitialized === null) {
    return (
      <Card className="auth-card">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card className="auth-card">
        <button onClick={() => navigate("/")} className="back-btn">
          <ArrowLeft />
          <span>Volver</span>
        </button>

        <div className="auth-header">
          <div className="auth-icon">
            <ShieldCheck />
          </div>
          <h2>{isInitialized ? "Acceso Organizador" : "Configurar Acceso"}</h2>
          <p>
            {isInitialized
              ? "Ingresa tu contrasena para administrar"
              : "Crea una contrasena para el organizador"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Contrasena"
            type="password"
            icon={Lock}
            placeholder={isInitialized ? "********" : "Minimo 4 caracteres"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {isInitialized ? "Ingresar" : "Crear y Continuar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
