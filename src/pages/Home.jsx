import { useNavigate } from "react-router-dom";
import { Settings, Users, Sparkles } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Card className="home-card">
        <div className="home-header">
          <div className="home-icon">
            <svg viewBox="0 0 100 100" width="48" height="48">
              <circle cx="50" cy="50" r="45" fill="#134e4a"/>
              <path d="M50 20 L55 40 L75 40 L60 52 L65 72 L50 60 L35 72 L40 52 L25 40 L45 40 Z" fill="#fbbf24"/>
              <circle cx="30" cy="25" r="4" fill="#fff" opacity="0.8"/>
              <circle cx="75" cy="30" r="3" fill="#fff" opacity="0.6"/>
              <circle cx="20" cy="55" r="2" fill="#fff" opacity="0.5"/>
            </svg>
          </div>
          <h2>¡Hola, chicos!</h2>
          <p>¿Cómo desean continuar?</p>
        </div>

        <div className="home-buttons">
          <Button
            variant="primary"
            size="lg"
            icon={Settings}
            fullWidth
            onClick={() => navigate("/admin")}
            className="role-btn"
          >
            <div className="role-btn-content">
              <span>Soy el Organizador</span>
              <span>Configura participantes y sorteo</span>
            </div>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            icon={Users}
            fullWidth
            onClick={() => navigate("/participant")}
            className="role-btn"
          >
            <div className="role-btn-content">
              <span>Soy Participante</span>
              <span>Ver a quién me tocó regalar</span>
            </div>
          </Button>
        </div>

        <div className="home-footer">
          <Sparkles />
          <span>Sorteo justo y aleatorio garantizado</span>
        </div>
      </Card>
    </div>
  );
}
