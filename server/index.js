import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8099;
const DB_PATH = path.join(__dirname, 'db.json');

// Initialize DB file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    admin: { passwordHash: null },
    participants: [],
    restrictions: [],
    assignments: [],
    drawCompleted: false
  }, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());

// Database helpers
function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/status', (req, res) => {
  const db = readDB();
  res.json({
    initialized: !!db.admin.passwordHash,
    drawCompleted: db.drawCompleted
  });
});

app.post('/api/admin/init', (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }

  const db = readDB();
  if (db.admin.passwordHash) {
    return res.status(400).json({ error: 'El administrador ya fue configurado' });
  }

  db.admin.passwordHash = bcrypt.hashSync(password, 10);
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const db = readDB();

  if (!db.admin.passwordHash) {
    return res.status(400).json({ error: 'Administrador no configurado' });
  }

  if (bcrypt.compareSync(password, db.admin.passwordHash)) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

app.post('/api/admin/data', (req, res) => {
  const { password } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  res.json({
    participants: db.participants,
    restrictions: db.restrictions,
    drawCompleted: db.drawCompleted
  });
});

app.post('/api/admin/participants/add', (req, res) => {
  const { password, name } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (db.drawCompleted) {
    return res.status(400).json({ error: 'No se puede modificar después del sorteo' });
  }

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  const trimmedName = name.trim();
  if (db.participants.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
    return res.status(400).json({ error: 'Este participante ya existe' });
  }

  const participant = {
    id: uuidv4(),
    name: trimmedName,
    accessCode: uuidv4().substring(0, 8).toUpperCase()
  };

  db.participants.push(participant);
  writeDB(db);
  res.json({ participant });
});

app.post('/api/admin/participants/remove', (req, res) => {
  const { password, participantId } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (db.drawCompleted) {
    return res.status(400).json({ error: 'No se puede modificar después del sorteo' });
  }

  db.participants = db.participants.filter(p => p.id !== participantId);
  db.restrictions = db.restrictions.filter(r =>
    r.person1Id !== participantId && r.person2Id !== participantId
  );
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/restrictions/add', (req, res) => {
  const { password, person1Id, person2Id } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (db.drawCompleted) {
    return res.status(400).json({ error: 'No se puede modificar después del sorteo' });
  }

  if (person1Id === person2Id) {
    return res.status(400).json({ error: 'Debes seleccionar dos personas diferentes' });
  }

  // Check if restriction already exists (bidirectional)
  const exists = db.restrictions.some(r =>
    (r.person1Id === person1Id && r.person2Id === person2Id) ||
    (r.person1Id === person2Id && r.person2Id === person1Id)
  );

  if (exists) {
    return res.status(400).json({ error: 'Esta restricción ya existe' });
  }

  db.restrictions.push({ person1Id, person2Id });
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/restrictions/remove', (req, res) => {
  const { password, person1Id, person2Id } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (db.drawCompleted) {
    return res.status(400).json({ error: 'No se puede modificar después del sorteo' });
  }

  db.restrictions = db.restrictions.filter(r =>
    !((r.person1Id === person1Id && r.person2Id === person2Id) ||
      (r.person1Id === person2Id && r.person2Id === person1Id))
  );
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/draw', (req, res) => {
  const { password } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (db.drawCompleted) {
    return res.status(400).json({ error: 'El sorteo ya fue realizado' });
  }

  if (db.participants.length < 2) {
    return res.status(400).json({ error: 'Se necesitan al menos 2 participantes' });
  }

  const participants = db.participants;

  // Build adjacency - who can give to whom (bidirectional restrictions)
  const canGiveTo = {};
  participants.forEach(p => {
    canGiveTo[p.id] = participants
      .filter(other => {
        if (other.id === p.id) return false;
        const restricted = db.restrictions.some(r =>
          (r.person1Id === p.id && r.person2Id === other.id) ||
          (r.person1Id === other.id && r.person2Id === p.id)
        );
        return !restricted;
      })
      .map(other => other.id);
  });

  const assignments = findValidAssignment(participants.map(p => p.id), canGiveTo);

  if (!assignments) {
    return res.status(400).json({
      error: 'No es posible realizar el sorteo con las restricciones actuales. Intenta eliminar algunas restricciones.'
    });
  }

  db.assignments = assignments;
  db.drawCompleted = true;
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/reset', (req, res) => {
  const { password } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  db.assignments = [];
  db.drawCompleted = false;
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/admin/full-reset', (req, res) => {
  const { password } = req.body;
  const db = readDB();

  if (!bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  db.participants = [];
  db.restrictions = [];
  db.assignments = [];
  db.drawCompleted = false;
  writeDB(db);
  res.json({ success: true });
});

// ==================== PARTICIPANT ROUTES ====================

app.post('/api/participant/login', (req, res) => {
  const { accessCode } = req.body;
  const db = readDB();

  const participant = db.participants.find(
    p => p.accessCode.toUpperCase() === accessCode.toUpperCase()
  );

  if (!participant) {
    return res.status(401).json({ error: 'Código de acceso inválido' });
  }

  let assignment = null;
  if (db.drawCompleted) {
    const record = db.assignments.find(a => a.giverId === participant.id);
    if (record) {
      const receiver = db.participants.find(p => p.id === record.receiverId);
      assignment = receiver ? receiver.name : null;
    }
  }

  res.json({
    name: participant.name,
    drawCompleted: db.drawCompleted,
    assignment
  });
});

// ==================== ALGORITHM ====================

function findValidAssignment(participantIds, canGiveTo) {
  const n = participantIds.length;
  const assignment = {};
  const assigned = new Set();

  const shuffled = [...participantIds].sort(() => Math.random() - 0.5);

  function backtrack(index) {
    if (index === n) return true;

    const giverId = shuffled[index];
    const possibleReceivers = canGiveTo[giverId].filter(r => !assigned.has(r));
    possibleReceivers.sort(() => Math.random() - 0.5);

    for (const receiverId of possibleReceivers) {
      assignment[giverId] = receiverId;
      assigned.add(receiverId);

      if (backtrack(index + 1)) return true;

      delete assignment[giverId];
      assigned.delete(receiverId);
    }

    return false;
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    shuffled.sort(() => Math.random() - 0.5);
    if (backtrack(0)) {
      return Object.entries(assignment).map(([giverId, receiverId]) => ({
        giverId,
        receiverId
      }));
    }
  }

  return null;
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
