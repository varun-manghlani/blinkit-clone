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

import AdminLayout from "./components/AdminLayout";
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
      {/* =====================================
          CUSTOMER NAVBAR
      ===================================== */}

      {!isAdminPage && <Navbar />}

      <Routes>
        {/* =====================================
            CUSTOMER ROUTES
        ===================================== */}

        <Route path="/" element={<Home />} />

        <Route path="/promo/:promoSlug" element={<PromoPage />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="/category/:category" element={<CategoryPage />} />

        <Route path="/collection/:collection" element={<CollectionPage />} />

        {/* =====================================
            ADMIN AUTH ROUTES
        ===================================== */}

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin/reset-otp" element={<AdminResetOtp />} />

        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* =====================================
            ADMIN PANEL
        ===================================== */}

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="settings" element={<AdminSettings />} />

          <Route path="banners" element={<AdminBanners />} />

          <Route path="promo-cards" element={<AdminPromoCards />} />

          <Route path="categories" element={<AdminCategories />} />

          <Route path="products" element={<AdminProducts />} />
          <Route
            path="/admin/products/:productId"
            element={<AdminProductForm />}
          />
        </Route>
      </Routes>

      {/* =====================================
          CUSTOMER LOGIN MODAL
      ===================================== */}

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
