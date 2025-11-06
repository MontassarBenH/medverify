import { Status } from '@prisma/client';

function autoCheck(p: {
  patientName?: string;
  medication?: string;
  quantity?: number;
  dateIssued?: Date | string | null;
  dosage?: string | null;
}) {
  const errors: string[] = [];
  if (!p.patientName || p.patientName.trim().length < 3) errors.push('patientName');
  if (!p.medication || p.medication.trim().length === 0) errors.push('medication');
  if (!p.quantity || isNaN(p.quantity) || p.quantity <= 0) errors.push('quantity');
  const d = p.dateIssued ? new Date(p.dateIssued as any) : null;
  if (!d || isNaN(d.getTime()) || d > new Date()) errors.push('dateIssued');
  const warn = !p.dosage ? ['dosage'] : [];
  const status: Status = errors.length ? Status.FEHLERHAFT : Status.PRUEFEN;
  return { status, errors, warn };
}

describe('autoCheck (unit)', () => {
  it('valid payload → PRUEFEN, warn bei fehlender dosage', () => {
    const r = autoCheck({
      patientName: 'Alice',
      medication: 'Ibuprofen',
      quantity: 1,
      dateIssued: '2025-01-10',
      dosage: null,
    });
    expect(r.errors).toEqual([]);
    expect(r.warn).toEqual(['dosage']);
    expect(r.status).toBe(Status.PRUEFEN);
  });

  it('medication leer → Fehler', () => {
    const r = autoCheck({
      patientName: 'Alice',
      medication: '',
      quantity: 1,
      dateIssued: '2025-01-10',
    });
    expect(r.errors).toContain('medication');
  });
});
