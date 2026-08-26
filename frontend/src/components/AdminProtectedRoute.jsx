import { Navigate, Outlet, useLocation } from "react-router-dom";

function AdminProtectedRoute() {
  const location = useLocation();

  const adminToken = localStorage.getItem("adminToken");
  const admin = localStorage.getItem("admin");

  if (!adminToken || !admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
