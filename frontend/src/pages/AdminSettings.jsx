import { useEffect, useState } from "react";

import "../styles/admin-settings.css";

function AdminSettings() {
  const [admins, setAdmins] = useState([]);
  const [totalAdmins, setTotalAdmins] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formLoading, setFormLoading] = useState(false);

  const [formError, setFormError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // FETCH ADMINS
  // ==========================================

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://65.0.32.187:5000/api/admin");

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch admins");

        return;
      }

      /*
        MongoDB normally returns _id.

        We convert it into id so the frontend
        always has one consistent property.
      */

      const normalizedAdmins = (data.admins || []).map((admin) => ({
        ...admin,

        id: admin.id || admin._id,
      }));

      setAdmins(normalizedAdmins);

      setTotalAdmins(data.totalAdmins ?? normalizedAdmins.length);
    } catch (error) {
      console.error("Fetch admins error:", error);

      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
    });

    setFormError("");
    setEditingAdmin(null);
    setShowCreateForm(false);
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE ADMIN
  // ==========================================

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!form.name || !form.email || !form.password) {
      setFormError("All fields are required");

      return;
    }

    try {
      setFormLoading(true);

      const response = await fetch("http://65.0.32.187:5000/api/admin", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Failed to create admin");

        return;
      }

      resetForm();

      await fetchAdmins();
    } catch (error) {
      console.error("Create admin error:", error);

      setFormError("Unable to connect to the server");
    } finally {
      setFormLoading(false);
    }
  };

  // ==========================================
  // START EDITING
  // ==========================================

  const startEditing = (admin) => {
    const adminId = admin.id || admin._id;

    if (!adminId) {
      console.error("Admin ID missing:", admin);

      setFormError("Admin ID is missing");

      return;
    }

    setEditingAdmin({
      ...admin,

      id: adminId,
    });

    setShowCreateForm(true);

    setForm({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
    });

    setFormError("");
  };

  // ==========================================
  // UPDATE ADMIN
  // ==========================================

  const handleUpdateAdmin = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!editingAdmin?.id) {
      setFormError("Admin ID is missing. Please try again.");

      return;
    }

    if (!form.name || !form.email) {
      setFormError("Name and email are required");

      return;
    }

    try {
      setFormLoading(true);

      const adminId = editingAdmin.id;

      console.log("Updating admin:", adminId);

      const response = await fetch(
        `http://65.0.32.187:5000/api/admin/${adminId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Failed to update admin");

        return;
      }

      resetForm();

      await fetchAdmins();
    } catch (error) {
      console.error("Update admin error:", error);

      setFormError("Unable to connect to the server");
    } finally {
      setFormLoading(false);
    }
  };

  // ==========================================
  // DELETE ADMIN
  // ==========================================

  const handleDeleteAdmin = async (admin) => {
    const adminId = admin.id || admin._id;

    if (!adminId) {
      alert("Admin ID is missing");

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://65.0.32.187:5000/api/admin/${adminId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete admin");

        return;
      }

      await fetchAdmins();
    } catch (error) {
      console.error("Delete admin error:", error);

      alert("Unable to connect to the server");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="admin-settings">
      {/* Header */}

      <div className="settings-page-header">
        <div>
          <h1>Settings</h1>

          <p>Manage administrator accounts</p>
        </div>
      </div>

      {/* Summary */}

      <div className="admin-management-summary">
        <div className="admin-total-card">
          <div className="admin-total-icon">👨‍💼</div>

          <div>
            <span>Total Admins</span>

            <strong>{totalAdmins}</strong>
          </div>
        </div>

        <button
          type="button"
          className="create-admin-button"
          onClick={() => {
            setShowCreateForm(true);

            setEditingAdmin(null);

            setForm({
              name: "",
              email: "",
              password: "",
            });

            setFormError("");
          }}
        >
          + Create Admin
        </button>
      </div>

      {/* Create / Edit Form */}

      {showCreateForm && (
        <div className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2>{editingAdmin ? "Edit Admin" : "Create Admin"}</h2>

              <p>
                {editingAdmin
                  ? "Update administrator information"
                  : "Add a new administrator"}
              </p>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
            <div className="admin-form-grid">
              {/* Name */}

              <div className="settings-form-group">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter admin name"
                  value={form.name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Email */}

              <div className="settings-form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter admin email"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Password */}

              <div className="settings-form-group">
                <label>
                  Password
                  {editingAdmin && <span> (leave blank to keep current)</span>}
                </label>

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={
                      editingAdmin ? "Enter new password" : "Enter password"
                    }
                    value={form.password}
                    onChange={handleInputChange}
                  />

                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Error */}

            {formError && (
              <div className="settings-form-error">{formError}</div>
            )}

            {/* Actions */}

            <div className="admin-form-actions">
              <button
                type="button"
                className="cancel-admin-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-admin-button"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editingAdmin
                    ? "Update Admin"
                    : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin List */}

      <div className="admin-list-card">
        <div className="admin-list-header">
          <div>
            <h2>Administrators</h2>

            <p>All admin accounts in your store</p>
          </div>
        </div>

        {/* Loading */}

        {loading && (
          <div className="admin-list-message">Loading administrators...</div>
        )}

        {/* Error */}

        {!loading && error && <div className="admin-list-error">{error}</div>}

        {/* Empty */}

        {!loading && !error && admins.length === 0 && (
          <div className="admin-list-message">No administrators found.</div>
        )}

        {/* Table */}

        {!loading && !error && admins.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => {
                  const adminId = admin.id || admin._id;

                  return (
                    <tr key={adminId}>
                      <td>
                        <div className="admin-name-cell">
                          <div className="small-admin-avatar">
                            {admin.name?.charAt(0).toUpperCase()}
                          </div>

                          <strong>{admin.name}</strong>
                        </div>
                      </td>

                      <td>{admin.email}</td>

                      <td>
                        <span className="admin-role">{admin.role}</span>
                      </td>

                      <td>
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="edit-admin-button"
                            onClick={() => startEditing(admin)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-admin-button"
                            onClick={() => handleDeleteAdmin(admin)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;
