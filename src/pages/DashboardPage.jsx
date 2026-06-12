import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import ConfirmDialog from '../components/ConfirmDialog';

const SIZE_LABELS = { S: 'Pequeno', M: 'Médio', L: 'Grande' };

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// dashboard com as reservas do utilizador autenticado
function DashboardPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  function loadReservations() {
    setError(null);
    api.get('/api/reservations')
      .then(setReservations)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadReservations();
  }, []);

  function performCancel() {
    const id = confirmingId;
    setConfirmingId(null);
    setCancelingId(id);
    api.delete(`/api/reservations/${id}`)
      .then(() => {
        setReservations((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((err) => alert('Erro ao cancelar: ' + err.message))
      .finally(() => setCancelingId(null));
  }

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-950">Minhas reservas</h1>
            <p className="text-sm text-neutral-700 mt-1">Olá, {user.username}.</p>
          </div>
          <Link
            to="/reservations/new"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
          >
            Nova reserva
          </Link>
        </div>

        {error && (
          <p className="mb-4 text-red-600">Erro: {error}</p>
        )}

        {!reservations && !error && (
          <p className="text-neutral-600">A carregar...</p>
        )}

        {reservations && reservations.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded p-8 text-center">
            <p className="text-neutral-700">Ainda sem reservas.</p>
            <Link to="/" className="mt-3 inline-block text-orange-600 hover:underline text-sm">
              Ver estações disponíveis
            </Link>
          </div>
        )}

        {reservations && reservations.length > 0 && (
          <div className="flex flex-col gap-3">
            {reservations.map((r) => {
              const locker = r.locker || {};
              const station = locker.station || {};
              return (
                <div key={r.id} className="bg-white border border-neutral-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-neutral-950">{station.name || 'Estação'}</h3>
                      <p className="text-sm text-neutral-700">
                        Cacifo {locker.number} - {SIZE_LABELS[locker.size] || locker.size}
                      </p>
                    </div>
                    <p className="font-bold">{Number(r.totalPrice).toFixed(2)} €</p>
                  </div>

                  <p className="text-sm text-neutral-600 mt-3">
                    {formatDate(r.startTime)} até {formatDate(r.endTime)}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/reservations/${r.id}`}
                      className="text-sm px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-100"
                    >
                      Ver detalhe
                    </Link>
                    <button
                      onClick={() => setConfirmingId(r.id)}
                      disabled={cancelingId === r.id}
                      className="text-sm px-3 py-1 border border-neutral-300 rounded hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {cancelingId === r.id ? 'A cancelar...' : 'Cancelar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingId !== null}
        title="Cancelar reserva?"
        message="Esta ação não pode ser desfeita."
        confirmText="Sim, cancelar"
        cancelText="Manter"
        variant="danger"
        onConfirm={performCancel}
        onCancel={() => setConfirmingId(null)}
      />
    </div>
  );
}

export default DashboardPage;
