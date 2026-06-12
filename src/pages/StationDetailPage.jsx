import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const SIZE_LABELS = { S: 'Pequeno', M: 'Médio', L: 'Grande' };

function StationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [error, setError] = useState(null);

  // GET /api/stations/:id ja inclui os cacifos aninhados
  useEffect(() => {
    setStation(null);
    setError(null);
    api.get(`/api/stations/${id}`)
      .then(setStation)
      .catch((err) => setError(err));
  }, [id]);

  // se nao autenticado, manda para login antes de seguir para o form
  function handleReserve(lockerId) {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/reservations/new?lockerId=${lockerId}`);
    }
  }

  if (error && error.status === 404) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/" className="text-sm text-neutral-600 hover:text-orange-600">Voltar</Link>
          <h1 className="text-2xl font-bold mt-4">Estação não encontrada</h1>
          <p className="text-neutral-700 mt-2">A estação com ID {id} não existe.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/" className="text-sm text-neutral-600 hover:text-orange-600">Voltar</Link>
          <p className="mt-4 text-red-600">Erro: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-neutral-600">A carregar...</p>
        </div>
      </div>
    );
  }

  const lockers = station.lockers || [];

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="text-sm text-neutral-600 hover:text-orange-600">Voltar às estações</Link>

        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-bold text-neutral-950">{station.name}</h1>
          <p className="text-neutral-700 mt-1">{station.city}</p>
          <p className="text-sm text-neutral-500 mt-1">{station.address}</p>
          {!station.isActive && (
            <span className="inline-block mt-2 text-xs bg-neutral-200 px-2 py-1 rounded">Inativa</span>
          )}
        </div>

        <h2 className="text-xl font-semibold text-neutral-950 mb-4">
          Cacifos ({lockers.length})
        </h2>

        {lockers.length === 0 && (
          <p className="text-neutral-600">Esta estação ainda não tem cacifos.</p>
        )}

        {lockers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lockers.map((l) => (
              <div key={l.id} className="bg-white border border-neutral-200 rounded p-4">
                <p className="text-xs text-neutral-500">Cacifo</p>
                <p className="text-2xl font-bold text-neutral-950">{l.number}</p>
                <p className="text-sm text-neutral-700 mt-2">
                  Tamanho: {SIZE_LABELS[l.size] || l.size}
                </p>
                <p className="text-sm text-neutral-700">
                  {Number(l.pricePerHour).toFixed(2)} € / hora
                </p>
                <button
                  onClick={() => handleReserve(l.id)}
                  className="mt-3 w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
                >
                  Reservar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StationDetailPage;
