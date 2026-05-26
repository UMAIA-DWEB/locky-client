import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const linkBase = 'text-sm font-medium transition-colors';
  const linkInactive = 'text-slate-600 hover:text-amber-700';
  const linkActive = 'text-amber-700';

  // sair de rotas privadas antes de limpar a sessão (evita ser empurrado para /login pelo PrivateRoute)
  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-amber-700"
        >
          LockyClient
        </Link>

        <div className="flex items-center gap-6">
          {loading ? (
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          ) : user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Dashboard
              </NavLink>
              <span className="text-sm text-slate-600">
                Olá, <span className="font-medium text-slate-900">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className={`${linkBase} ${linkInactive}`}
              >
                Terminar sessão
              </button>
            </>
          ) : (
            <Link to="/login" className={`${linkBase} ${linkInactive}`}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
