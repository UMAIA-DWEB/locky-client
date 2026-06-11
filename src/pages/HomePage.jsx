import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

function HomePage() {
  const [stations, setStations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/stations')
      .then(setStations)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            LockyClient
          </h1>
        </header>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Estações Disponíveis</h2>
          </div>

          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Erro ao carregar: {error}</span>
              </div>
            </div>
          )}

          {!stations && !error && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                <li key={skeleton} className="flex h-32 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100"></div>
                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100"></div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {stations && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stations.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/stations/${s.id}`}
                    className="group relative flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-slate-800 transition-colors group-hover:text-amber-700">
                        {s.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {s.city}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-sm text-slate-400 truncate">
                        {s.address}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
}

export default HomePage;
