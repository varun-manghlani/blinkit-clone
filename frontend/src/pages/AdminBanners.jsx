import { useEffect, useState } from "react";
import "../styles/admin-banners.css";

function AdminBanners() {
  const [banner, setBanner] = useState(null);
  const [image, setImage] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/hero-banner`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch banner");
      }

      setBanner(data.heroBanner);

      if (data.heroBanner) {
        setRedirectUrl(data.heroBanner.redirectUrl || "");
      }
    } catch (err) {
      console.error("Fetch banner error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (!selectedImage) {
      return;
    }

    setImage(selectedImage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!redirectUrl.trim()) {
      setError("Redirect URL is required");
      return;
    }

    if (!banner && !image) {
      setError("Please select a hero banner image");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }

      formData.append("redirectUrl", redirectUrl.trim());

      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/admin/hero-banner`, {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update hero banner");
      }

      setBanner(data.heroBanner);
      setImage(null);

      setMessage("Hero banner updated successfully");

      // Reset file input
      event.target.reset();
    } catch (err) {
      console.error("Update banner error:", err);

      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-banner-page">
        <div className="admin-banner-card">
          <h1>Hero Banner</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-banner-page">
      <div className="admin-banner-card">
        <div className="admin-banner-header">
          <div>
            <h1>Hero Banner</h1>

            <p>Update the main banner displayed on the home page.</p>
          </div>
        </div>

        {message && <div className="admin-banner-success">{message}</div>}

        {error && <div className="admin-banner-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-banner-preview">
            <h2>Current Banner</h2>

            {banner ? (
              <img
                src={`${API_URL}${banner.imageUrl}`}
                alt="Current hero banner"
              />
            ) : (
              <div className="admin-banner-empty">
                No hero banner uploaded yet
              </div>
            )}
          </div>

          <div className="admin-banner-form">
            <div className="admin-banner-field">
              <label htmlFor="hero-image">Update Image</label>

              <input
                id="hero-image"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
              />

              {image && <p className="selected-file">Selected: {image.name}</p>}
            </div>

            <div className="admin-banner-field">
              <label htmlFor="redirect-url">Redirect URL</label>

              <input
                id="redirect-url"
                type="text"
                placeholder="/collection/fresh-produce-dairy"
                value={redirectUrl}
                onChange={(event) => setRedirectUrl(event.target.value)}
              />

              <small>Example: /collection/fresh-produce-dairy</small>
            </div>

            <button
              type="submit"
              className="admin-banner-button"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Banner"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminBanners;
