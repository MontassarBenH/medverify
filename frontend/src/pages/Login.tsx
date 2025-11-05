import { useState } from "react";
import { api, setToken } from "../api";

export default function Login({ onLoggedIn }:{ onLoggedIn:(role:string)=>void }) {
  const [email,setEmail]=useState("apo@demo.local");
  const [password,setPassword]=useState("password123");
  const [err,setErr]=useState("");

  const submit=async(e:any)=>{ e.preventDefault(); setErr("");
    try{
      const { data } = await api.post("/auth/login",{email,password});
      setToken(data.token); onLoggedIn(data.role);
    }catch{ setErr("Login fehlgeschlagen"); }
  };

  return (
    <main className="min-h-dvh bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center">
      <div className="max-w-md mx-auto w-full px-4">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-1">Willkommen </h2>
          <p className="text-sm text-gray-600 mb-4">Logge dich ein, um Rezepte zu erfassen oder zu prüfen.</p>
          <form onSubmit={submit} className="space-y-3">
            {err && <div role="alert" className="text-sm text-red-600">{err}</div>}
            <div className="space-y-1">
              <label className="label">E-Mail</label>
              <input className="input" placeholder="E-Mail" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="label">Passwort</label>
              <input className="input" placeholder="Passwort" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full">Einloggen</button>
            <p className="text-xs text-gray-500">
              Demo-Accounts: <code>apo@demo.local</code> / <code>pruefer@demo.local</code> – Passwort: <code>password123</code>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
