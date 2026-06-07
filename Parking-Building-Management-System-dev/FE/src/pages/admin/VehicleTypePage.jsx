import React, { useEffect, useState } from 'react';
import vehicleTypeApi from '../../api/vehicleTypeApi';

// ---------------------------------------------------------------------------
// Inline styles (không dùng file CSS riêng để giữ component tự-chứa)
// ---------------------------------------------------------------------------
const styles = {
  container: {
    padding: '0',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  th: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#374151',
    borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    color: '#7c3aed',
    borderRadius: '20px',
    padding: '3px 12px',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  btnEdit: {
    background: '#eff6ff',
    color: '#3b82f6',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    marginRight: '8px',
  },
  btnDelete: {
    background: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  // Modal overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '20px',
    resize: 'vertical',
    minHeight: '80px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnCancel: {
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  alertError: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '16px',
  },
  alertSuccess: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#16a34a',
    fontSize: '14px',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    color: '#94a3b8',
    fontSize: '15px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '48px',
    color: '#6366f1',
    fontSize: '15px',
  },
};

// ---------------------------------------------------------------------------
// Component chính
// ---------------------------------------------------------------------------
const VehicleTypePage = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Trạng thái modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = tạo mới
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // -------------------------------------------------------------------------
  // Load data
  // -------------------------------------------------------------------------
  const fetchVehicleTypes = async () => {
    setLoading(true);
    try {
      const res = await vehicleTypeApi.getAll();
      setVehicleTypes(res.data);
    } catch (err) {
      console.error('[VehicleTypePage] Lỗi khi tải danh sách:', err);
      showMessage('error', 'Không thể tải danh sách loại phương tiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '' });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setFormError('');
  };

  // -------------------------------------------------------------------------
  // Submit form (tạo mới hoặc cập nhật)
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setFormError('Tên loại phương tiện không được để trống.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingItem) {
        // CẬP NHẬT
        await vehicleTypeApi.update(editingItem.id, { name, description });
        showMessage('success', `Cập nhật loại phương tiện '${name.toUpperCase()}' thành công!`);
      } else {
        // TẠO MỚI
        await vehicleTypeApi.create({ name, description });
        showMessage('success', `Thêm loại phương tiện '${name.toUpperCase()}' thành công!`);
      }
      closeModal();
      fetchVehicleTypes();
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      setFormError(serverMsg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Xóa
  // -------------------------------------------------------------------------
  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa loại phương tiện "${item.name}"?`)) return;
    try {
      await vehicleTypeApi.remove(item.id);
      showMessage('success', `Đã xóa loại phương tiện '${item.name}' thành công!`);
      fetchVehicleTypes();
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      showMessage('error', serverMsg || 'Không thể xóa. Vui lòng thử lại.');
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div style={styles.container}>
      {/* Tiêu đề trang */}
      <div style={styles.header}>
        <h1 style={styles.title}>🚗 Quản lý Loại Phương Tiện</h1>
        <button style={styles.btnPrimary} onClick={openCreateModal}>
          <span>+</span> Thêm loại mới
        </button>
      </div>

      {/* Thông báo toàn trang */}
      {message.text && (
        <div style={message.type === 'success' ? styles.alertSuccess : styles.alertError}>
          {message.text}
        </div>
      )}

      {/* Bảng dữ liệu */}
      {loading ? (
        <div style={styles.loadingState}>⏳ Đang tải dữ liệu...</div>
      ) : vehicleTypes.length === 0 ? (
        <div style={styles.emptyState}>
          Chưa có loại phương tiện nào. Nhấn <strong>"Thêm loại mới"</strong> để bắt đầu.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tên loại</th>
              <th style={styles.th}>Mô tả</th>
              <th style={styles.th}>Ngày tạo</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vehicleTypes.map((vt) => (
              <tr key={vt.id}>
                <td style={styles.td}>{vt.id}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{vt.name}</span>
                </td>
                <td style={styles.td}>{vt.description || <em style={{ color: '#94a3b8' }}>Không có</em>}</td>
                <td style={styles.td}>
                  {vt.createdAt ? new Date(vt.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td style={styles.td}>
                  <button style={styles.btnEdit} onClick={() => openEditModal(vt)}>
                    ✏️ Sửa
                  </button>
                  <button style={styles.btnDelete} onClick={() => handleDelete(vt)}>
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal tạo mới / chỉnh sửa */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingItem ? '✏️ Chỉnh sửa loại phương tiện' : '➕ Thêm loại phương tiện mới'}
            </h2>

            {/* Lỗi form */}
            {formError && <div style={styles.alertError}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <label style={styles.label} htmlFor="vt-name">
                Tên loại phương tiện <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="vt-name"
                style={styles.input}
                type="text"
                placeholder="VD: CAR, MOTORBIKE, TRUCK..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />

              <label style={styles.label} htmlFor="vt-description">
                Mô tả
              </label>
              <textarea
                id="vt-description"
                style={styles.textarea}
                placeholder="Mô tả ngắn về loại phương tiện này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={closeModal}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTypePage;
