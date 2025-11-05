import { useEffect, useState } from "react";
import { api } from "../api";
import StatusBadge from "./StatusBadge";

type Status = "EINGEREICHT"|"PRUEFEN"|"GUELTIG"|"FEHLERHAFT"|"ABGELEHNT";

export default function PrescriptionList({ role }:{ role:string }) {
  const [items,setItems]=useState<any[]>([]);
  const [filter,setFilter]=useState<Status|"ALLE">("ALLE");
  const [loading, setLoading] = useState(false);

  const load=async()=>{
    setLoading(true);
    try {
      const {data}=await api.get("/prescriptions",{ params: filter==="ALLE"?{}:{status:filter} });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ load(); },[filter]);

  const setStatus=async(id:number, status:Status)=>{
    await api.patch(`/prescriptions/${id}/status`, { status });
    load();
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dashboard</h3>
        <select className="input w-auto" data-testid="status-filter" value={filter} onChange={e=>setFilter(e.target.value as any)}>
          {["ALLE","EINGEREICHT","PRUEFEN","GUELTIG","FEHLERHAFT","ABGELEHNT"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Lade…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">
          Keine Einträge {filter!=="ALLE" && <>für <b>{filter}</b></> } vorhanden.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(p=>(
            <li key={p.id} className="card">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{p.patientName}</div>
                  <div className="text-sm text-gray-600 truncate">{p.medication} – Menge: {p.quantity}</div>
                </div>
                <StatusBadge status={p.status} className={`data-[id=${p.id}]`} />
              </div>

              {role==="PRUEFER" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-primary" onClick={()=>setStatus(p.id,"GUELTIG")}>GUELTIG</button>
                  <button className="btn-ghost" onClick={()=>setStatus(p.id,"ABGELEHNT")}>ABGELEHNT</button>
                  <button className="btn-ghost" onClick={()=>setStatus(p.id,"FEHLERHAFT")}>FEHLERHAFT</button>
                </div>
              )}

              {/* Für Cypress bleibt der Test-Selector gleich */}
              <em data-testid={`status-${p.id}`} className="sr-only">{p.status}</em>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
