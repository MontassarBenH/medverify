import StatusBadge from "./StatusBadge";

export default function Header({
  role,
  onLogout,
}: {
  role: string;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-600"></div>
          <h1 className="text-xl font-bold">MedVerify</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Angemeldet als <span className="font-medium">{role}</span>
          </div>
          <StatusBadge status={role === "PRUEFER" ? "PRUEFEN" : "EINGEREICHT"} />
          <button onClick={onLogout} className="btn-ghost">Logout</button>
        </div>
      </div>
    </header>
  );
}
