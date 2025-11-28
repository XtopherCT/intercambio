import { Gift } from "lucide-react";
import Snowfall from "./Snowfall";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Snowfall />

      <div className="layout-content">
        <header className="header">
          <div className="header-icon">
            <Gift />
          </div>
          <h1>Amigo Secreto</h1>
          <p>Organiza tu intercambio de regalos</p>
        </header>

        <main className="main">
          <div className="container">
            {children}
          </div>
        </main>

        <footer className="footer">
          <p>Hecho con amor para intercambios navidenos</p>
        </footer>
      </div>
    </div>
  );
}
