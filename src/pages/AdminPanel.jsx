import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Ban, Link2, Shuffle, RotateCcw, Trash2,
  Plus, X, LogOut, CheckCircle2, Clock, AlertTriangle,
  Copy, Check, UserPlus, ArrowLeftRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const tabs = [
  { id: 'participants', label: 'Participantes', icon: Users },
  { id: 'restrictions', label: 'Restricciones', icon: Ban },
  { id: 'codes', label: 'Codigos', icon: Link2 }
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participants');
  const [participants, setParticipants] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [drawCompleted, setDrawCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const password = sessionStorage.getItem('adminPassword');

  useEffect(() => {
    if (!password) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [password, navigate]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) { navigate('/admin'); return; }
      const data = await res.json();
      setParticipants(data.participants);
      setRestrictions(data.restrictions);
      setDrawCompleted(data.drawCompleted);
    } catch { toast.error('Error cargando datos'); }
    finally { setLoading(false); }
  };

  const addParticipant = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/admin/participants/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, name: newName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setParticipants([...participants, data.participant]);
      setNewName('');
      toast.success('Participante agregado');
    } catch (err) { toast.error(err.message); }
  };

  const removeParticipant = async (id) => {
    try {
      await fetch('/api/admin/participants/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, participantId: id })
      });
      setParticipants(participants.filter(p => p.id !== id));
      setRestrictions(restrictions.filter(r => r.person1Id !== id && r.person2Id !== id));
      toast.success('Participante eliminado');
    } catch { toast.error('Error eliminando participante'); }
  };

  const addRestriction = async (e) => {
    e.preventDefault();
    if (!person1 || !person2 || person1 === person2) {
      toast.error('Selecciona dos personas diferentes');
      return;
    }
    try {
      const res = await fetch('/api/admin/restrictions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, person1Id: person1, person2Id: person2 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRestrictions([...restrictions, { person1Id: person1, person2Id: person2 }]);
      setPerson1('');
      setPerson2('');
      toast.success('Restriccion agregada');
    } catch (err) { toast.error(err.message); }
  };

  const removeRestriction = async (p1, p2) => {
    try {
      await fetch('/api/admin/restrictions/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, person1Id: p1, person2Id: p2 })
      });
      setRestrictions(restrictions.filter(r =>
        !((r.person1Id === p1 && r.person2Id === p2) || (r.person1Id === p2 && r.person2Id === p1))
      ));
      toast.success('Restriccion eliminada');
    } catch { toast.error('Error eliminando restriccion'); }
  };

  const performDraw = async () => {
    if (participants.length < 2) { toast.error('Necesitas al menos 2 participantes'); return; }
    if (!confirm('Realizar el sorteo?')) return;
    try {
      const res = await fetch('/api/admin/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDrawCompleted(true);
      toast.success('Sorteo completado!');
    } catch (err) { toast.error(err.message); }
  };

  const resetDraw = async () => {
    if (!confirm('Resetear el sorteo?')) return;
    try {
      await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      setDrawCompleted(false);
      toast.success('Sorteo reseteado');
    } catch { toast.error('Error reseteando sorteo'); }
  };

  const fullReset = async () => {
    if (!confirm('BORRAR TODO?')) return;
    if (!confirm('Estas seguro?')) return;
    try {
      await fetch('/api/admin/full-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      setParticipants([]);
      setRestrictions([]);
      setDrawCompleted(false);
      toast.success('Todo borrado');
    } catch { toast.error('Error'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Codigo copiado');
  };

  const logout = () => {
    sessionStorage.removeItem('adminPassword');
    navigate('/');
  };

  const getName = (id) => participants.find(p => p.id === id)?.name || '';

  if (loading) {
    return (
      <Card className="admin-panel">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card className="admin-panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-icon"><Users /></div>
            <h2>Panel de Control</h2>
          </div>
          <Button variant="ghost" size="sm" icon={LogOut} onClick={logout}>Salir</Button>
        </div>

        <div className={"status-banner " + (drawCompleted ? "completed" : "pending")}>
          {drawCompleted ? (
            <><CheckCircle2 /><span>Sorteo completado - Los participantes pueden ver sus asignaciones</span></>
          ) : (
            <><Clock /><span>Pendiente - {participants.length} participante(s)</span></>
          )}
        </div>

        <div className="tabs-container">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={"tab-btn " + (activeTab === tab.id ? "active" : "")}>
              <tab.icon /><span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'participants' && (
            <div className="tab-panel">
              <div className="section-header">
                <h3>Participantes</h3>
                <span className="badge">{participants.length}</span>
              </div>

              {!drawCompleted && (
                <form onSubmit={addParticipant} className="add-form">
                  <div className="form-input-wrapper">
                    <Input placeholder="Nombre del participante" icon={UserPlus} value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <Button type="submit" variant="primary" icon={Plus}>Agregar</Button>
                </form>
              )}

              {participants.length === 0 ? (
                <div className="empty-state"><Users /><p>No hay participantes aun</p></div>
              ) : (
                <div className="participants-grid">
                  {participants.map((p) => (
                    <div key={p.id} className="participant-card">
                      <div className="participant-info">
                        <div className="participant-avatar">{p.name.charAt(0).toUpperCase()}</div>
                        <span className="participant-name">{p.name}</span>
                      </div>
                      {!drawCompleted && (
                        <button onClick={() => removeParticipant(p.id)} className="remove-btn"><X /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'restrictions' && (
            <div className="tab-panel">
              <div className="section-header"><h3>Restricciones</h3></div>

              <div className="info-box warning">
                <AlertTriangle />
                <p>Las restricciones son <strong>bidireccionales</strong>: si Ana no puede dar a Pedro, Pedro tampoco puede dar a Ana.</p>
              </div>

              {!drawCompleted && (
                <form onSubmit={addRestriction} className="restriction-form">
                  <div className="restriction-inputs">
                    <div className="form-input-wrapper">
                      <Select placeholder="Primera persona..." options={participants.map(p => ({ value: p.id, label: p.name }))} value={person1} onChange={(e) => setPerson1(e.target.value)} />
                    </div>
                    <div className="restriction-arrow"><ArrowLeftRight /></div>
                    <div className="form-input-wrapper">
                      <Select placeholder="Segunda persona..." options={participants.map(p => ({ value: p.id, label: p.name }))} value={person2} onChange={(e) => setPerson2(e.target.value)} />
                    </div>
                    <Button type="submit" variant="primary" icon={Plus}>Agregar</Button>
                  </div>
                </form>
              )}

              {restrictions.length === 0 ? (
                <div className="empty-state"><Ban /><p>No hay restricciones configuradas</p></div>
              ) : (
                <div className="restrictions-list">
                  {restrictions.map((r, i) => (
                    <div key={i} className="restriction-card">
                      <div className="restriction-info">
                        <Ban />
                        <span className="restriction-name">{getName(r.person1Id)}</span>
                        <ArrowLeftRight />
                        <span className="restriction-name">{getName(r.person2Id)}</span>
                      </div>
                      {!drawCompleted && (
                        <button onClick={() => removeRestriction(r.person1Id, r.person2Id)} className="remove-btn"><X /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'codes' && (
            <div className="tab-panel">
              <div className="section-header"><h3>Codigos de Acceso</h3></div>

              <div className="info-box info">
                <Link2 />
                <p>Comparte estos codigos <strong>en privado</strong> con cada participante para que vean su asignacion.</p>
              </div>

              {participants.length === 0 ? (
                <div className="empty-state"><Link2 /><p>Agrega participantes para ver sus codigos</p></div>
              ) : (
                <div className="codes-grid">
                  {participants.map((p) => (
                    <div key={p.id} className="code-card">
                      <p className="code-name">{p.name}</p>
                      <div className="code-display">
                        <code className="access-code">{p.accessCode}</code>
                        <button onClick={() => copyCode(p.accessCode)} className="copy-btn">
                          {copiedCode === p.accessCode ? <Check /> : <Copy />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="panel-actions">
          {!drawCompleted ? (
            <Button variant="primary" size="lg" icon={Shuffle} onClick={performDraw} disabled={participants.length < 2} className="action-btn-main">
              Realizar Sorteo
            </Button>
          ) : (
            <Button variant="warning" size="lg" icon={RotateCcw} onClick={resetDraw} className="action-btn-main">
              Resetear Sorteo
            </Button>
          )}
          <Button variant="outline" size="lg" icon={Trash2} onClick={fullReset}>Borrar Todo</Button>
        </div>
      </Card>
    </div>
  );
}
