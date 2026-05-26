import { useAuth } from '../hooks/useAuth';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Bem-vindo, <span className="font-medium text-amber-700">{user.username}</span>!
          </p>
        </header>

        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">
            As tuas reservas vão aparecer aqui.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
