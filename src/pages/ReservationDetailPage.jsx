import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';

const SIZE_LABELS = { S: 'Pequeno', M: 'Médio', L: 'Grande' };

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setReservation(null);
    setError(null);
    api.get(`/api/reservations/${id}`)
      .then(setReservation)
      .catch((err) => setError(err));
  }, [id]);

  function performCancel() {
    setShowConfirm(false);
    setCanceling(true);
    api.delete(`/api/reservations/${id}`)
      .then(() => navigate('/dashboard'))
      .catch((err) => {
        alert('Erro ao cancelar: ' + err.message);
        setCanceling(false);
      });
  }

  // API protege com middleware isOwner, trata 403 e 404 separadamente
  if (error && error.status === 403) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link to="/dashboard" className="text-sm text-neutral-600 hover:text-orange-600">
            Voltar ao dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-4">Acesso restrito</h1>
          <p className="text-neutral-700 mt-2">Esta reserva pertence a outro utilizador.</p>
        </div>
      </div>
    );
  }

  if (error && error.status === 404) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link to="/dashboard" className="text-sm text-neutral-600 hover:text-orange-600">
            Voltar ao dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-4">Reserva não encontrada</h1>
          <p className="text-neutral-700 mt-2">A reserva com ID {id} não existe.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-red-600">Erro: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-neutral-600">A carregar...</p>
        </div>
      </div>
    );
  }

  const locker = reservation.locker || {};
  const station = locker.station || {};

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="text-sm text-neutral-600 hover:text-orange-600">
          Voltar ao dashboard
        </Link>

        <h1 className="text-2xl font-bold text-neutral-950 mt-4 mb-1">
          Reserva #{reservation.id}
        </h1>
        <p className="text-neutral-700 mb-6">{station.name} - {station.city}</p>

        <div className="bg-white border border-neutral-200 rounded p-6">
          <div className="mb-4">
            <p className="text-xs text-neutral-500">Cacifo</p>
            <p className="text-neutral-950">
              Cacifo {locker.number} ({SIZE_LABELS[locker.size] || locker.size})
            </p>
            <p className="text-sm text-neutral-600">{Number(locker.pricePerHour).toFixed(2)} €/hora</p>
          </div>

          {station.address && (
            <div className="mb-4">
              <p className="text-xs text-neutral-500">Morada</p>
              <p className="text-neutral-950">{station.address}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-neutral-500">Início</p>
              <p className="text-neutral-950">{formatDate(reservation.startTime)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Fim</p>
              <p className="text-neutral-950">{formatDate(reservation.endTime)}</p>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-2xl font-bold text-neutral-950">
              {Number(reservation.totalPrice).toFixed(2)} €
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Link
            to={`/reservations/${id}/edit`}
            className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-100"
          >
            Editar datas
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={canceling}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
          >
            {canceling ? 'A cancelar...' : 'Cancelar reserva'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Cancelar reserva?"
        message="Esta ação não pode ser desfeita."
        confirmText="Sim, cancelar"
        cancelText="Manter"
        variant="danger"
        onConfirm={performCancel}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

export default ReservationDetailPage;
