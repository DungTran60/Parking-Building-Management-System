import React, { useEffect, useState } from 'react';
import floorApi from '../../api/floorApi';

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
  badgeFloor: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    color: '#0369a1',
    borderRadius: '20px',
    padding: '3px 12px',
    fontSize: '13px',
    fontWeight: 600,
  },
  badgeSlots: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    color: '#15803d',
    borderRadius: '20px',
    padding: '3px 12px',
    fontSize: '13px',
    fontWeight: 600,
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
    width: '440px',
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
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '4px',
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
  hintText: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '-12px',
    marginBottom: '16px',
  },
};

// ---------------------------------------------------------------------------
// Component chính
// ---------------------------------------------------------------------------
const FloorPage = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Trạng thái modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = tạo mới
  const [formData, setFormData] = useState({ floorName: '', totalSlots: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // -------------------------------------------------------------------------
  // Load data
  // -------------------------------------------------------------------------
  const fetchFloors = async () => {
    setLoading(true);
    try {
      const res = await floorApi.getAll();
      setFloors(res.data);
    } catch (err) {
      console.error('[FloorPage] Lỗi khi tải danh sách tầng:', err);
      showMessage('error', 'Không thể tải danh sách tầng gửi xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
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
    setFormData({ floorName: '', totalSlots: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ floorName: item.floorName, totalSlots: String(item.totalSlots) });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ floorName: '', totalSlots: '' });
    setFormError('');
  };

  // -------------------------------------------------------------------------
  // Submit form (tạo mới hoặc cập nhật)
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const floorName = formData.floorName.trim();
    const totalSlots = parseInt(formData.totalSlots, 10);

    // Validate phía client
    if (!floorName) {
      setFormError('Tên tầng không được để trống.');
      return;
    }
    if (!formData.totalSlots || isNaN(totalSlots) || totalSlots <= 0) {
      setFormError('Tổng số chỗ đỗ xe phải là số nguyên dương.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingItem) {
        // CẬP NHẬT
        await floorApi.update(editingItem.id, { floorName, totalSlots });
        showMessage('success', `Cập nhật tầng '${floorName}' thành công!`);
      } else {
        // TẠO MỚI
        await floorApi.create({ floorName, totalSlots });
        showMessage('success', `Thêm tầng '${floorName}' thành công!`);
      }
      closeModal();
      fetchFloors();
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
    if (!window.confirm(`Bạn có chắc muốn xóa tầng "${item.floorName}"?\nTất cả chỗ đỗ xe thuộc tầng này cũng sẽ bị xóa.`)) return;
    try {
      await floorApi.remove(item.id);
      showMessage('success', `Đã xóa tầng '${item.floorName}' thành công!`);
      fetchFloors();
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      showMessage('error', serverMsg || 'Không thể xóa tầng. Vui lòng thử lại.');
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div style={styles.container}>
      {/* Tiêu đề trang */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏢 Quản lý Tầng Gửi Xe</h1>
        <button style={styles.btnPrimary} onClick={openCreateModal}>
          <span>+</span> Thêm tầng mới
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
      ) : floors.length === 0 ? (
        <div style={styles.emptyState}>
          Chưa có tầng nào. Nhấn <strong>"Thêm tầng mới"</strong> để bắt đầu.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tên tầng</th>
              <th style={styles.th}>Tổng số chỗ</th>
              <th style={styles.th}>Ngày tạo</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {floors.map((floor) => (
              <tr key={floor.id}>
                <td style={styles.td}>{floor.id}</td>
                <td style={styles.td}>
                  <span style={styles.badgeFloor}>{floor.floorName}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.badgeSlots}>{floor.totalSlots} chỗ</span>
                </td>
                <td style={styles.td}>
                  {floor.createdAt ? new Date(floor.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td style={styles.td}>
                  <button style={styles.btnEdit} onClick={() => openEditModal(floor)}>
                    ✏️ Sửa
                  </button>
                  <button style={styles.btnDelete} onClick={() => handleDelete(floor)}>
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
              {editingItem ? '✏️ Chỉnh sửa tầng gửi xe' : '➕ Thêm tầng gửi xe mới'}
            </h2>

            {/* Lỗi form */}
            {formError && <div style={styles.alertError}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <label style={styles.label} htmlFor="floor-name">
                Tên tầng <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="floor-name"
                style={styles.input}
                type="text"
                placeholder="VD: Tầng 1, Tầng B1, Tầng hầm..."
                value={formData.floorName}
                onChange={(e) => setFormData({ ...formData, floorName: e.target.value })}
                autoFocus
              />

              <label style={styles.label} htmlFor="floor-slots">
                Tổng số chỗ đỗ xe <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="floor-slots"
                style={styles.input}
                type="number"
                min="1"
                placeholder="VD: 50"
                value={formData.totalSlots}
                onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
              />
              <p style={styles.hintText}>Số lượng chỗ đỗ xe tối đa của tầng này.</p>

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

export default FloorPage;
