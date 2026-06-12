import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  // se ja esta autenticado, redireciona para a home (nao faz sentido ver login)
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="bg-stone-100 min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">A verificar sessão...</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-neutral-200 rounded p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-neutral-950 mb-2">Entrar</h1>
        <p className="text-neutral-700 text-sm mb-6">
          Usa a tua conta GitHub para acederes às tuas reservas.
        </p>

        {error === 'oauth_failed' && (
          <p className="mb-4 text-sm text-red-600">
            Falha na autenticação com o GitHub. Tenta novamente.
          </p>
        )}

        <button
          onClick={login}
          className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-2 rounded"
        >
          Entrar com GitHub
        </button>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-neutral-600 hover:text-orange-600">
            Voltar à lista de estações
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
