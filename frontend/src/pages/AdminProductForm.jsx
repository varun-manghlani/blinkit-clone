import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../styles/admin-product-form.css";

const API_URL = "http://localhost:5000";

function AdminProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(productId);

  const [loading, setLoading] = useState(isEditMode);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [image, setImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    categorySlug: "",
    quantity: "",
    price: "",
    mrp: "",
    discount: "",
    description: "",
    stock: "",
  });

  // ==========================================
  // FETCH PRODUCT
  // ==========================================

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/products/${productId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load product");
        }

        const product = data.product;

        setForm({
          name: product.name || "",
          category: product.category || "",
          categorySlug: product.categorySlug || "",
          quantity: product.quantity || "",
          price: product.price !== undefined ? product.price : "",
          mrp: product.mrp !== undefined ? product.mrp : "",
          discount: product.discount !== undefined ? product.discount : "",
          description: product.description || "",
          stock: product.stock !== undefined ? product.stock : "",
        });

        setImagePreview(getImageUrl(product.image));
      } catch (error) {
        console.error("Fetch product error:", error);

        setError(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isEditMode]);

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setImage(selectedFile);

    setImagePreview(URL.createObjectURL(selectedFile));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required");
      return;
    }

    if (!form.categorySlug.trim()) {
      setError("Category slug is required");
      return;
    }

    if (!form.quantity.trim()) {
      setError("Quantity is required");
      return;
    }

    if (form.price === "" || Number.isNaN(Number(form.price))) {
      setError("Valid price is required");
      return;
    }

    if (form.mrp === "" || Number.isNaN(Number(form.mrp))) {
      setError("Valid MRP is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }

      formData.append("name", form.name.trim());

      formData.append("category", form.category.trim());

      formData.append("categorySlug", form.categorySlug.trim());

      formData.append("quantity", form.quantity.trim());

      formData.append("price", String(form.price));

      formData.append("mrp", String(form.mrp));

      formData.append(
        "discount",
        form.discount === "" ? "0" : String(form.discount),
      );

      formData.append("description", form.description.trim());

      formData.append("stock", form.stock === "" ? "0" : String(form.stock));

      const url = isEditMode
        ? `${API_URL}/api/admin/products/${productId}`
        : `${API_URL}/api/admin/products`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      setSuccess(
        isEditMode
          ? "Product updated successfully"
          : "Product created successfully",
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (error) {
      console.error("Save product error:", error);

      setError(error.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${form.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      setSuccess("Product permanently deleted successfully");

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (error) {
      console.error("Delete product error:", error);

      setError(error.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="admin-product-form-page">
        <div className="admin-product-form-loading">Loading product...</div>
      </main>
    );
  }

  return (
    <main className="admin-product-form-page">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="admin-product-form-header">
        <div>
          <button
            type="button"
            className="admin-product-form-back"
            onClick={() => navigate("/admin/products")}
          >
            ← Back to Products
          </button>

          <h1>{isEditMode ? "Edit Product" : "Add Product"}</h1>

          <p>
            {isEditMode ? `Product ID: ${productId}` : "Create a new product"}
          </p>
        </div>
      </div>

      {/* ======================================
          MESSAGES
      ====================================== */}

      {error && <div className="admin-product-form-error">{error}</div>}

      {success && <div className="admin-product-form-success">{success}</div>}

      {/* ======================================
          FORM
      ====================================== */}

      <form className="admin-product-form" onSubmit={handleSubmit}>
        {/* IMAGE */}

        <section className="admin-product-form-card">
          <h2>Product Image</h2>

          <div className="admin-product-image-section">
            <div className="admin-product-image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt={form.name || "Product"} />
              ) : (
                <span>No image selected</span>
              )}
            </div>

            <div>
              <label className="admin-product-file-button">
                {image ? "Change Image" : "Choose Image"}

                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
                  onChange={handleImageChange}
                />
              </label>

              <p className="admin-product-file-hint">JPG, PNG, WEBP or AVIF</p>
            </div>
          </div>
        </section>

        {/* BASIC INFORMATION */}

        <section className="admin-product-form-card">
          <h2>Product Information</h2>

          <div className="admin-product-form-grid">
            <div className="admin-product-field admin-product-field-full">
              <label>Product Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product name"
              />
            </div>

            <div className="admin-product-field">
              <label>Category</label>

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Dairy & Breakfast"
              />
            </div>

            <div className="admin-product-field">
              <label>Category Slug</label>

              <input
                type="text"
                name="categorySlug"
                value={form.categorySlug}
                onChange={handleChange}
                placeholder="dairy-breakfast"
              />
            </div>

            <div className="admin-product-field">
              <label>Quantity</label>

              <input
                type="text"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="500 ml"
              />
            </div>

            <div className="admin-product-field">
              <label>Price</label>

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="30"
              />
            </div>

            <div className="admin-product-field">
              <label>MRP</label>

              <input
                type="number"
                name="mrp"
                min="0"
                step="0.01"
                value={form.mrp}
                onChange={handleChange}
                placeholder="35"
              />
            </div>

            <div className="admin-product-field">
              <label>Discount (%)</label>

              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                value={form.discount}
                onChange={handleChange}
                placeholder="10"
              />
            </div>

            <div className="admin-product-field">
              <label>Stock</label>

              <input
                type="number"
                name="stock"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="20"
              />
            </div>

            <div className="admin-product-field admin-product-field-full">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Product description"
                rows="5"
              />
            </div>
          </div>
        </section>

        {/* ACTIONS */}

        <div className="admin-product-form-actions">
          <button
            type="button"
            className="admin-product-cancel-button"
            onClick={() => navigate("/admin/products")}
            disabled={saving || deleting}
          >
            Cancel
          </button>

          {isEditMode && (
            <button
              type="button"
              className="admin-product-delete-button"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>
          )}

          <button
            type="submit"
            className="admin-product-save-button"
            disabled={saving || deleting}
          >
            {saving
              ? "Updating..."
              : isEditMode
                ? "Update Product"
                : "Create Product"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AdminProductForm;
