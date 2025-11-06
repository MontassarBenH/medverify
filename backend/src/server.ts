import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { PrismaClient, Status } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function auth(roles?: string[]) {
  return async (req: any, res: any, next: any) => {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ error: "No token" });
    try {
      const token = h.replace("Bearer ", "");
      const payload: any = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}


app.post("/dev/seed", async (_req, res) => {
  await prisma.prescription.deleteMany();

  const pass = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "apo@demo.local" },
    update: {},
    create: { email: "apo@demo.local", password: pass, role: "APOTHEKER" },
  });

  await prisma.user.upsert({
    where: { email: "pruefer@demo.local" },
    update: {},
    create: { email: "pruefer@demo.local", password: pass, role: "PRUEFER" },
  });

  res.json({ ok: true, reset: true });
});

/**
 * Login → JWT
 */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Bad creds" });
  }
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({ token, role: user.role });
});

/**
 * Auto-Plausibilitätscheck
 */
function autoCheck(p: {
  patientName?: string;
  medication?: string;
  quantity?: number;
  dateIssued?: Date | string | null;
  dosage?: string | null;
}) {
  const errors: string[] = [];

  // Patient name: required + at least 3 chars
  if (!p.patientName || p.patientName.trim().length < 3) {
    errors.push("patientName");
  }

  // Medication: required
  if (!p.medication || p.medication.trim().length === 0) {
    errors.push("medication");
  }

  // Quantity: must be > 0 and a valid number
  if (!p.quantity || isNaN(p.quantity) || p.quantity <= 0) {
    errors.push("quantity");
  }

  // Date validation: required, valid, and not in the future
  let d: Date | null = null;
  if (p.dateIssued) {
    try {
      d = new Date(p.dateIssued);
    } catch {
      d = null;
    }
  }

  if (!d || isNaN(d.getTime()) || d > new Date()) {
    errors.push("dateIssued");
  }

  // Warn if dosage missing, but not a hard error
  const warn = !p.dosage ? ["dosage"] : [];

  // Status assignment
  const status: Status = errors.length ? Status.FEHLERHAFT : Status.PRUEFEN;

  return { status, errors, warn };
}


/**
 * Duplikat-Check: gleicher Patient + Medikament am selben Kalendertag
 */
async function hasDuplicateSameDay(
  p: { patientName: string; medication: string; dateIssued: Date }
) {
  const start = new Date(p.dateIssued);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const existing = await prisma.prescription.findFirst({
    where: {
      patientName: p.patientName,
      medication: p.medication,
      dateIssued: { gte: start, lt: end },
    },
  });
  return Boolean(existing);
}

function parseValidDate(v: unknown): Date | null {
  if (v == null) return null;
  const d = new Date(v as any);
  return isNaN(d.getTime()) ? null : d;
}



app.post(
  "/prescriptions",
  auth(["APOTHEKER"]),
  upload.single("file"),
  async (req: any, res) => {
    try {
      const { patientName, medication, dosage, quantity, dateIssued } = req.body;

      // 1) Rohdaten (ohne Date-Parsing) an autoCheck geben
      const raw = {
        patientName,
        medication,
        dosage: dosage ?? null,
        quantity: Number(quantity),
        dateIssued, 
      };

      const check = autoCheck(raw);

      // 2) Bei harten Validierungsfehlern (inkl. dateIssued) NICHT speichern
      if (check.errors.includes("patientName") ||
          check.errors.includes("medication") ||
          check.errors.includes("quantity")   ||
          check.errors.includes("dateIssued")) {
        return res.status(400).json({ error: "validation", check });
      }

      // 3) Sicher parsen
      const validDate = parseValidDate(dateIssued);
      if (!validDate) {
        check.errors.push("dateIssued");
        return res.status(400).json({ error: "validation", check });
      }

      // 4) Duplikat-Check mit gültigem Datum
      const isDup = await hasDuplicateSameDay({
        patientName: raw.patientName!,
        medication: raw.medication!,
        dateIssued: validDate,
      });
      if (isDup) {
        check.errors.push("duplicate");
        return res.status(409).json({ error: "duplicate", check });
      }

      // 5) Speichern – JETZT mit geprüftem Date
      const created = await prisma.prescription.create({
        data: {
          patientName: raw.patientName!,
          medication: raw.medication!,
          dosage: raw.dosage,
          quantity: raw.quantity,
          dateIssued: validDate, 
          status: check.errors.length ? Status.FEHLERHAFT : Status.PRUEFEN,
          uploadedFile: req.file?.path || null,
          createdById: req.user.sub,
        },
      });

      return res.status(201).json({ prescription: created, check });
    } catch (err: any) {
      console.error("Create prescription failed:", err);
      return res
        .status(500)
        .json({ error: "Failed to create prescription", detail: String(err?.message ?? err) });
    }
  }
);

/**
 * Liste holen 
 */
app.get("/prescriptions", auth(), async (req: any, res) => {
  const { status } = req.query as { status?: Status };
  const where = status ? { status } : {};
  const items = await prisma.prescription.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
});

/**
 * Status ändern (nur Prüfer)
 */
app.patch("/prescriptions/:id/status", auth(["PRUEFER"]), async (req: any, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: Status };

  const exists = await prisma.prescription.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.prescription.update({
    where: { id },
    data: { status },
  });
  res.json(updated);
});

/**
 * Start
 */
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

export default app;

