import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import AdminBanners from "./pages/AdminBanners";
import AdminCategories from "./pages/AdminCategories";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminPromoCards from "./pages/AdminPromoCards";
import AdminResetOtp from "./pages/AdminResetOtp";
import AdminSettings from "./pages/AdminSettings";

import CategoryPage from "./pages/CategoryPage";
import CollectionPage from "./pages/CollectionPage";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import PromoPage from "./pages/PromoPage";
import ResetPassword from "./pages/ResetPassword";
import SearchPage from "./pages/SearchPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";

import AdminLayout from "./components/AdminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import LoginModal from "./components/LoginModal";
import Navbar from "./components/Navbar";

import { AuthProvider } from "./context/AuthContext";

import AdminProductForm from "./pages/AdminProductForm";

import "./styles/global.css";

function AppContent() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {/* Customer Navbar */}
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* =====================================
            CUSTOMER PAGES
        ===================================== */}

        <Route path="/" element={<Home />} />

        <Route path="/promo/:promoSlug" element={<PromoPage />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="/category/:category" element={<CategoryPage />} />

        <Route path="/collection/:collection" element={<CollectionPage />} />

        <Route path="/payment" element={<PaymentPage />} />

        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* =====================================
            ADMIN LOGIN / RESET
            These are PUBLIC
        ===================================== */}

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin/reset-otp" element={<AdminResetOtp />} />

        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* =====================================
            EVERYTHING BELOW IS PROTECTED
        ===================================== */}

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="products" element={<AdminProducts />} />

            <Route path="products/:productId" element={<AdminProductForm />} />

            <Route path="categories" element={<AdminCategories />} />

            <Route path="promo-cards" element={<AdminPromoCards />} />

            <Route path="banners" element={<AdminBanners />} />

            <Route path="orders" element={<div>Orders</div>} />

            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>

      {/* Customer Login */}
      {!isAdminPage && <LoginModal />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
