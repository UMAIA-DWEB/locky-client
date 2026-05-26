import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="mx-auto mt-20 max-w-6xl text-center">
        <h1 className="text-7xl font-extrabold tracking-tight text-slate-900">404</h1>
        <p className="mt-3 text-lg text-slate-500">Página não encontrada.</p>
        <Link
          to="/"
          className="mt-6 inline-block text-base font-medium text-amber-700 transition-colors hover:underline"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
