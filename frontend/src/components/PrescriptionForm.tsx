import { useState } from "react";
import { api } from "../api";

export default function PrescriptionForm({ onCreated }:{ onCreated:()=>void }) {
  const [form,setForm]=useState({ patientName:"", medication:"", dosage:"", quantity:"", dateIssued:"" });
  const [file,setFile]=useState<File|null>(null);
  const [msg,setMsg]=useState("");

  const submit=async(e:any)=>{ e.preventDefault(); setMsg("");
    const data = new FormData();
    Object.entries(form).forEach(([k,v])=>data.append(k,String(v)));
    if(file) data.append("file", file);

    try{
      const res = await api.post("/prescriptions", data, { headers: { "Content-Type":"multipart/form-data" }});
      const { check } = res.data;

      if (check.errors.length) {
        if (check.errors.includes("duplicate")) {
          setMsg("Fehler: mögliches Duplikat (gleicher Patient/Medikament am selben Tag).");
        } else {
          setMsg("Fehler: "+check.errors.join(", "));
        }
      } else if (check.warn.length) {
        setMsg("Warnung: Dosierung fehlt.");
      } else {
        setMsg("");
      }
      onCreated();
    } catch (err:any) {
      const status = err?.response?.status;
      const check = err?.response?.data?.check;
      if (status === 409 && check?.errors?.includes?.("duplicate")) {
        setMsg("Fehler: mögliches Duplikat (gleicher Patient/Medikament am selben Tag).");
        return; 
      }

      setMsg("Fehler: Einreichen fehlgeschlagen.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h3 className="text-lg font-semibold">Rezept erfassen</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="label">Patient</label>
          <input className="input" placeholder="Patient" onChange={e=>setForm({...form,patientName:e.target.value})}/>
        </div>
        <div className="space-y-1">
          <label className="label">Medikament</label>
          <input className="input" placeholder="Medikament" onChange={e=>setForm({...form,medication:e.target.value})}/>
        </div>
        <div className="space-y-1">
          <label className="label">Dosierung (z.B. 500mg)</label>
          <input className="input" placeholder="Dosierung (z.B. 500mg)" onChange={e=>setForm({...form,dosage:e.target.value})}/>
        </div>
        <div className="space-y-1">
          <label className="label">Menge</label>
          <input className="input" placeholder="Menge" type="number" onChange={e=>setForm({...form,quantity:e.target.value})}/>
        </div>
        <div className="space-y-1">
          <label className="label">Ausstellungsdatum</label>
          <input className="input" placeholder="Ausstellungsdatum" type="date" onChange={e=>setForm({...form,dateIssued:e.target.value})}/>
        </div>
        <div className="space-y-1">
          <label className="label">Datei (optional)</label>
          <input className="input" type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary">Einreichen</button>
      </div>
      {msg && <p className="mt-2 text-sm" data-testid="plausi-msg">{msg}</p>}
    </form>
  );
}
