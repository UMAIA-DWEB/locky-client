import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // enquanto verifica a sessão, mostrar spinner em vez de redirecionar para login (evita flash quando o user existe mas /auth/me ainda não respondeu)
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      </div>
    );
  }

  if (!user) {
    // guardar o caminho de onde vinha para poder voltar lá depois do login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // utilizador autenticado, então renderiza a rota protegida
  return <Outlet />;
}

export default PrivateRoute;
