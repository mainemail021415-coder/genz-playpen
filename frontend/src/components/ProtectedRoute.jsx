import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Kung walang token, i-redirect pabalik sa /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kung may token, payagang ma-render ang pahina
  return <Outlet />;
}

export default ProtectedRoute;