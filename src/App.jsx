import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import StationDetailPage from './pages/StationDetailPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewReservationPage from './pages/NewReservationPage';
import ReservationDetailPage from './pages/ReservationDetailPage';
import EditReservationPage from './pages/EditReservationPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stations/:id" element={<StationDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reservations/new" element={<NewReservationPage />} />
            <Route path="/reservations/:id" element={<ReservationDetailPage />} />
            <Route path="/reservations/:id/edit" element={<EditReservationPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
