import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/admin-categories.css";

const API_URL = "http://localhost:5000";

function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [productSearch, setProductSearch] = useState("");

  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/categories`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Fetch categories error:", error);

      setError(error.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await fetch(`${API_URL}/api/products`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);

      setError(error.message || "Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl}`;
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setEditingId(null);

    setImage(null);
    setImagePreview("");

    setName("");
    setSlug("");
    setRedirectUrl("");

    setSelectedProducts([]);
    setProductSearch("");

    setError("");
    setSuccess("");

    setShowForm(false);
  };

  // ==========================================
  // CREATE
  // ==========================================

  const handleCreate = () => {
    setEditingId(null);

    setImage(null);
    setImagePreview("");

    setName("");
    setSlug("");
    setRedirectUrl("");

    setSelectedProducts([]);
    setProductSearch("");

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (category) => {
    setEditingId(category._id);

    setImage(null);

    setImagePreview(getImageUrl(category.imageUrl));

    setName(category.name || "");
    setSlug(category.slug || "");

    setRedirectUrl(category.redirectUrl || "");

    setSelectedProducts(category.products || []);

    setProductSearch("");

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
  // ADD PRODUCT TO CATEGORY
  // ==========================================

  const handleAddProduct = (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      return;
    }

    const alreadyAdded = selectedProducts.some(
      (item) => String(item._id || item.id) === String(productId),
    );

    if (alreadyAdded) {
      return;
    }

    setSelectedProducts([...selectedProducts, product]);
  };

  // ==========================================
  // REMOVE PRODUCT FROM CATEGORY
  // ==========================================

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(
      selectedProducts.filter(
        (product) => String(product._id || product.id) !== String(productId),
      ),
    );
  };

  // ==========================================
  // SEARCH PRODUCTS
  // ==========================================

  const filteredProducts = products.filter((product) => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return false;
    }

    const productName = product.name || "";

    return productName.toLowerCase().includes(search);
  });

  // ==========================================
  // SAVE CATEGORY
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editingId && !image) {
      setError("Please select a category image");
      return;
    }

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    if (!slug.trim()) {
      setError("Category slug is required");
      return;
    }

    if (!redirectUrl.trim()) {
      setError("Category path is required");
      return;
    }

    try {
      setFormLoading(true);

      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }

      formData.append("name", name.trim());

      formData.append("slug", slug.trim());

      formData.append("redirectUrl", redirectUrl.trim());

      const productIds = selectedProducts.map(
        (product) => product._id || product.id,
      );

      formData.append("products", JSON.stringify(productIds));

      const url = editingId
        ? `${API_URL}/api/admin/categories/${editingId}`
        : `${API_URL}/api/admin/categories`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save category");
      }

      setSuccess(
        editingId
          ? "Category updated successfully"
          : "Category created successfully",
      );

      await fetchCategories();

      setTimeout(() => {
        resetForm();
      }, 700);
    } catch (error) {
      console.error("Save category error:", error);

      setError(error.message || "Failed to save category");
    } finally {
      setFormLoading(false);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/admin/categories/${category._id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      setSuccess("Category deleted successfully");

      await fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      setError(error.message || "Failed to delete category");
    }
  };

  return (
    <main className="admin-category-page">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="admin-category-header">
        <div>
          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <h1>Categories</h1>

          <p>Manage category images, paths and products.</p>
        </div>

        <button
          type="button"
          className="admin-add-category-button"
          onClick={handleCreate}
        >
          + Add Category
        </button>
      </div>

      {/* ======================================
          MESSAGES
      ====================================== */}

      {error && <div className="admin-category-error">{error}</div>}

      {success && <div className="admin-category-success">{success}</div>}

      {/* ======================================
          CREATE / EDIT FORM
      ====================================== */}

      {showForm && (
        <section className="category-form-card">
          <div className="category-form-header">
            <div>
              <h2>{editingId ? "Edit Category" : "Create Category"}</h2>

              <p>Add image, path and products.</p>
            </div>

            <button
              type="button"
              className="category-close-button"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* IMAGE */}

            <div className="category-form-section">
              <label>Category Image</label>

              <div className="category-image-upload">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="category-image-preview"
                  />
                ) : (
                  <div className="category-image-placeholder">
                    No image selected
                  </div>
                )}

                <label className="category-file-button">
                  {image ? "Change Image" : "Choose Image"}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {editingId && (
                <small>
                  Leave the image unchanged if you don't want to replace it.
                </small>
              )}
            </div>

            {/* NAME */}

            <div className="category-form-section">
              <label>Category Name</label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Fruits & Vegetables"
              />
            </div>

            {/* SLUG */}

            <div className="category-form-section">
              <label>Category Slug</label>

              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="fruits-vegetables"
              />
            </div>

            {/* PATH */}

            <div className="category-form-section">
              <label>Path / Redirect URL</label>

              <input
                type="text"
                value={redirectUrl}
                onChange={(event) => setRedirectUrl(event.target.value)}
                placeholder="/category/fruits-vegetables"
              />
            </div>

            {/* PRODUCTS */}

            <div className="category-products-section">
              <div className="category-products-heading">
                <div>
                  <h3>Products</h3>

                  <p>
                    {selectedProducts.length} product
                    {selectedProducts.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>

              {/* SELECTED PRODUCTS */}

              {selectedProducts.length > 0 && (
                <div className="selected-category-products">
                  {selectedProducts.map((product) => {
                    const productId = product._id || product.id;

                    return (
                      <div
                        key={String(productId)}
                        className="selected-category-product"
                      >
                        <div className="selected-category-product-info">
                          {product.image && (
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                            />
                          )}

                          <div>
                            <strong>{product.name}</strong>

                            {product.price !== undefined && (
                              <span>₹{product.price}</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="remove-category-product-button"
                          onClick={() => handleRemoveProduct(productId)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SEARCH */}

              <div className="category-product-search">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products to add..."
                />
              </div>

              {/* RESULTS */}

              {productSearch.trim() && (
                <div className="category-product-search-results">
                  {productsLoading ? (
                    <div>Loading products...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div>No products found</div>
                  ) : (
                    filteredProducts.map((product) => {
                      const productId = product._id || product.id;

                      const alreadyAdded = selectedProducts.some(
                        (item) =>
                          String(item._id || item.id) === String(productId),
                      );

                      return (
                        <div
                          key={String(productId)}
                          className="category-product-result"
                        >
                          <div className="category-product-result-info">
                            {product.image && (
                              <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                              />
                            )}

                            <div>
                              <strong>{product.name}</strong>

                              {product.price !== undefined && (
                                <span>₹{product.price}</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => handleAddProduct(product)}
                          >
                            {alreadyAdded ? "Added" : "+ Add"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* FORM ACTIONS */}

            <div className="category-form-actions">
              <button
                type="button"
                className="category-cancel-button"
                onClick={resetForm}
                disabled={formLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-save-button"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ======================================
          ALL CATEGORIES
      ====================================== */}

      <section className="admin-category-list-section">
        <div className="admin-category-list-header">
          <div>
            <h2>All Categories</h2>

            <p>
              {categories.length} categor
              {categories.length !== 1 ? "ies" : "y"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="admin-category-loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="admin-category-empty">
            <h3>No Categories Yet</h3>

            <p>Create your first category.</p>

            <button type="button" onClick={handleCreate}>
              + Add Category
            </button>
          </div>
        ) : (
          <div className="admin-category-grid">
            {categories.map((category) => (
              <article key={category._id} className="admin-category-card">
                {/* IMAGE */}

                <div className="admin-category-image-wrapper">
                  <img
                    src={getImageUrl(category.imageUrl)}
                    alt={category.name}
                  />

                  <span
                    className={
                      category.isActive
                        ? "category-active-badge"
                        : "category-inactive-badge"
                    }
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* DETAILS */}

                <div className="admin-category-details">
                  <h3>{category.name}</h3>

                  <div className="category-detail-row">
                    <span>Path</span>

                    <strong>{category.redirectUrl}</strong>
                  </div>

                  <div className="category-detail-row">
                    <span>Products</span>

                    <strong>{category.products?.length || 0}</strong>
                  </div>
                </div>

                {/* PRODUCT CHIPS */}

                {category.products?.length > 0 && (
                  <div className="category-product-preview">
                    {category.products.slice(0, 5).map((product) => (
                      <span key={product._id} className="category-product-chip">
                        {product.name}
                      </span>
                    ))}

                    {category.products.length > 5 && (
                      <span className="category-more-chip">
                        +{category.products.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* ACTIONS */}

                <div className="admin-category-actions">
                  <button
                    type="button"
                    className="category-edit-button"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="category-delete-button"
                    onClick={() => handleDelete(category)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminCategories;
