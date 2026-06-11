import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const SIZE_LABELS = {
  S: { label: 'Pequeno', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  M: { label: 'Médio',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  L: { label: 'Grande',  cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function StationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setStation(null);
    setError(null);
    api.get(`/api/stations/${id}`)
      .then(setStation)
      .catch((err) => setError(err));
  }, [id]);

  const handleReserve = (lockerId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/reservations/new?lockerId=${lockerId}`);
    }
  };

  // 404 - estação não existe
  if (error && error.status === 404) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-amber-700"
          >
            Voltar às estações
          </Link>
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Estação não encontrada</h1>
            <p className="mt-2 text-slate-500">
              A estação com ID <code className="text-slate-700">{id}</code> não existe ou foi removida.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // outro erro qualquer
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-amber-700"
          >
            Voltar às estações
          </Link>
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            Erro ao carregar a estação: {error.message}
          </div>
        </div>
      </div>
    );
  }

  // loading state - skeleton
  if (!station) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mb-2 h-10 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="mb-1 h-4 w-1/4 animate-pulse rounded bg-slate-100" />
          <div className="mb-10 h-4 w-1/3 animate-pulse rounded bg-slate-100" />
          <div className="mb-5 h-6 w-1/3 animate-pulse rounded bg-slate-200" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li
                key={i}
                className="flex h-36 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-7 w-20 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="h-5 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-20 animate-pulse rounded bg-slate-300" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // estação carregada
  const lockers = station.lockers || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-amber-700"
        >
          Voltar às estações
        </Link>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight">{station.name}</h1>
            {station.isActive ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Ativa
              </span>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                Inativa
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-base font-medium text-slate-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {station.city}
          </div>
          <p className="mt-1 text-sm text-slate-400">{station.address}</p>
        </header>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Cacifos disponíveis
              <span className="ml-2 text-base font-normal text-slate-400">
                ({lockers.length})
              </span>
            </h2>
          </div>

          {lockers.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-slate-500">Esta estação ainda não tem cacifos disponíveis.</p>
            </div>
          )}

          {lockers.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lockers.map((l) => {
                const size = SIZE_LABELS[l.size] || { label: l.size, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
                return (
                  <li
                    key={l.id}
                    className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Cacifo</p>
                        <p className="text-2xl font-bold text-slate-900">{l.number}</p>
                      </div>
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${size.cls}`}>
                        {size.label}
                      </span>
                    </div>

                    <div className="mt-auto flex items-baseline justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900">
                          €{Number(l.pricePerHour).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">/hora</span>
                      </div>
                      <button
                        onClick={() => handleReserve(l.id)}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        Reservar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default StationDetailPage;
