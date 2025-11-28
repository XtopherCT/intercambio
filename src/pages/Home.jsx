import { useNavigate } from "react-router-dom";
import { Settings, Users, TreePine, Sparkles } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Card className="home-card">
        <div className="home-header">
          <div className="home-icon">
            <TreePine />
          </div>
          <h2>Bienvenido!</h2>
          <p>Como deseas continuar?</p>
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
              <span>Ver a quien me toco regalar</span>
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
