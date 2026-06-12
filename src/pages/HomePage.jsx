import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

// pagina inicial publica com lista de estacoes
function HomePage() {
  const [stations, setStations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/stations')
      .then(setStations)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-950 mb-1">LockyClient</h1>
        <p className="text-neutral-700 mb-8">Reserve um cacifo em qualquer estação.</p>

        <h2 className="text-2xl font-semibold text-neutral-950 mb-4">Estações</h2>

        {error && (
          <p className="text-red-600 mb-4">Erro ao carregar: {error}</p>
        )}

        {!stations && !error && (
          <p className="text-neutral-600">A carregar...</p>
        )}

        {stations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stations.map((s) => (
              <Link
                key={s.id}
                to={`/stations/${s.id}`}
                className="block bg-white border border-neutral-200 rounded p-4 hover:border-orange-600"
              >
                <h3 className="text-lg font-semibold text-neutral-950">{s.name}</h3>
                <p className="text-sm text-neutral-700 mt-1">{s.city}</p>
                <p className="text-sm text-neutral-500 mt-2">{s.address}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
