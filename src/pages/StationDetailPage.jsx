import { useParams, Link } from 'react-router-dom';

function StationDetailPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-amber-700"
        >
          Voltar às estações
        </Link>
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Detalhe da estação</h1>
          <p className="mt-1 text-slate-500">ID: <code className="text-slate-700">{id}</code></p>
        </header>

        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">Oops, esta página ainda se encontra em construção!</p>
        </div>
      </div>
    </div>
  );
}

export default StationDetailPage;
