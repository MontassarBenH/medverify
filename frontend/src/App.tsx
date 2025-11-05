import { useState } from "react";
import Login from "./pages/Login";
import PrescriptionForm from "./components/PrescriptionForm";
import PrescriptionList from "./components/PrescriptionList";
import Header from "./components/Header";
import { clearToken } from "./api";

export default function App() {
  const [role, setRole] = useState<string | undefined>();

  if (!role) return <Login onLoggedIn={setRole} />;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <Header role={role} onLogout={() => { clearToken(); setRole(undefined); }} />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {role === "APOTHEKER" && <div className="card"><PrescriptionForm onCreated={()=>{}}/></div>}
        <div className="card"><PrescriptionList role={role}/></div>
      </main>
    </div>
  );
}
