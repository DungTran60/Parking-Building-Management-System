import React, { useEffect, useState } from 'react';
import pricingApi from '../../api/pricingApi';

const styles = {
  container: {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#1e293b',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '12px',
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
  },
  alertSuccess: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  // Modal styles
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
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnSubmit: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnCancel: {
    background: '#fff',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '10px',
  }
};

const PricingPage = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [baseRate, setBaseRate] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Tải bảng giá
  const loadPolicies = () => {
    pricingApi.getPricing()
      .then(res => {
        setPolicies(res.data || res);
      })
      .catch(err => console.error("Lỗi lấy cấu hình giá:", err));
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  // Bắt đầu chỉnh sửa
  const handleEditClick = (policy) => {
    setSelectedPolicy(policy);
    setBaseRate(policy.baseRate);
    setHourlyRate(policy.hourlyRate);
  };

  // Xác nhận lưu
  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      vehicleType: selectedPolicy.vehicleType,
      baseRate: parseFloat(baseRate),
      hourlyRate: parseFloat(hourlyRate)
    };

    pricingApi.updatePricing(payload)
      .then(res => {
        setSuccessMsg(`Đã cập nhật bảng giá xe ${payload.vehicleType} thành công!`);
        setSelectedPolicy(null);
        loadPolicies();
      })
      .catch(err => {
        setErrorMsg("Lỗi khi cập nhật bảng giá xe.");
        console.error(err);
      });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý Bảng giá (Pricing Policy)</h1>
        <p style={styles.subtitle}>Cài đặt giá mở cửa và cước phí gửi xe theo giờ cho các loại phương tiện</p>
      </div>

      {successMsg && <div style={styles.alertSuccess}>{successMsg}</div>}
      {errorMsg && <div style={{ ...styles.alertSuccess, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{errorMsg}</div>}

      <div style={styles.card}>
        <h2 style={{ fontSize: '17px', margin: '0 0 14px 0', color: '#1e293b' }}>Chính sách cước phí hiện tại</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Loại Phương Tiện</th>
                <th style={styles.th}>Giá mở cửa (Giờ đầu)</th>
                <th style={styles.th}>Phí đỗ tiếp theo (Mỗi giờ)</th>
                <th style={styles.th}>Cập nhật lần cuối</th>
                <th style={styles.th}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(policy => (
                <tr key={policy.id}>
                  <td style={styles.td}>{policy.id}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{policy.vehicleType}</span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{formatCurrency(policy.baseRate)}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#4f46e5' }}>{formatCurrency(policy.hourlyRate)}/giờ</td>
                  <td style={styles.td}>
                    {policy.lastUpdated ? new Date(policy.lastUpdated).toLocaleString('vi-VN') : 'Mặc định'}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.btnEdit}
                      onClick={() => handleEditClick(policy)}
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA GIÁ */}
      {selectedPolicy && (
        <div style={styles.overlay}>
          <form onSubmit={handleSave} style={styles.modal}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '18px', color: '#0f172a' }}>
              Chỉnh sửa giá cước: {selectedPolicy.vehicleType}
            </h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Giá mở cửa (Giờ đầu tiên)</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                step="500"
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Giá cước theo giờ (Các giờ tiếp theo)</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                step="500"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                style={styles.btnCancel}
                onClick={() => setSelectedPolicy(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                style={styles.btnSubmit}
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
