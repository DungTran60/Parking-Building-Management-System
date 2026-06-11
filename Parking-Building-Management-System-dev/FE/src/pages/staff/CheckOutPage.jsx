import React, { useEffect, useState } from 'react';
import sessionApi from '../../api/sessionApi';

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
  flexRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    flex: '1 1 350px',
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
  inputSearch: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
  },
  btnAction: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    backgroundColor: '#fff',
    marginBottom: '18px',
  },
  // Invoice Modal styles
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '30px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    position: 'relative',
    fontFamily: 'Courier, monospace', // Tạo style giống hóa đơn in
  },
  btnModalClose: {
    background: '#334155',
    color: '#fff',
    border: 'none',
    width: '100%',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  },
  invoiceDivider: {
    borderTop: '1px dashed #cbd5e1',
    margin: '14px 0',
  }
};

const CheckOutPage = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState('');

  // 1. Tải danh sách xe trong bãi
  const loadActiveSessions = () => {
    sessionApi.getActive()
      .then(res => {
        setActiveSessions(res.data || res);
      })
      .catch(err => console.error("Lỗi lấy danh sách xe gửi:", err));
  };

  useEffect(() => {
    loadActiveSessions();
  }, []);

  // Tìm kiếm cục bộ
  const filteredSessions = activeSessions.filter(s => 
    s.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xử lý Check-out
  const handleCheckOutSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedSession) return;

    setError('');
    const payload = {
      sessionId: selectedSession.id,
      paymentMethod: paymentMethod
    };

    sessionApi.checkOut(payload)
      .then(res => {
        const data = res.data || res;
        setInvoiceData(data); // Lưu thông tin hóa đơn nhận về để hiển thị modal
        setSelectedSession(null);
        loadActiveSessions(); // Cập nhật lại danh sách xe
      })
      .catch(err => {
        const msg = err.response?.data?.message || "Lỗi khi thực hiện check-out.";
        setError(msg);
      });
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (timestampStr) => {
    if (!timestampStr) return '-';
    const date = new Date(timestampStr);
    return date.toLocaleString('vi-VN');
  };

  // Hàm định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý Ra bãi (Check-out)</h1>
        <p style={styles.subtitle}>Kiểm tra xe ra, tính toán thời gian đỗ và thu phí gửi xe</p>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

      <div style={styles.flexRow}>
        {/* Danh sách xe đang gửi */}
        <div style={{ ...styles.card, flex: '2 1 600px' }}>
          <h2 style={{ fontSize: '17px', margin: '0 0 14px 0', color: '#1e293b' }}>Danh sách xe đang đỗ tại bãi</h2>
          
          <input
            style={styles.inputSearch}
            type="text"
            placeholder="🔍 Tìm kiếm biển số xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Biển số xe</th>
                  <th style={styles.th}>Vị trí đỗ</th>
                  <th style={styles.th}>Thời gian vào bãi</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map(session => (
                  <tr key={session.id}>
                    <td style={styles.td}>{session.id}</td>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#0f172a' }}>{session.licensePlate}</td>
                    <td style={styles.td}>{session.slotId}</td>
                    <td style={styles.td}>{formatDateTime(session.checkInTime)}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.btnAction}
                        onClick={() => setSelectedSession(session)}
                      >
                        Chọn tính phí
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                      Không tìm thấy xe nào trong bãi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột xử lý thanh toán */}
        <div style={styles.card}>
          <h2 style={{ fontSize: '17px', margin: '0 0 18px 0', color: '#1e293b' }}>Tính phí gửi xe</h2>
          
          {selectedSession ? (
            <div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Biển số:</strong> {selectedSession.licensePlate}</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Vị trí đỗ:</strong> Chỗ số {selectedSession.slotId}</p>
                <p style={{ margin: '0', fontSize: '14px' }}><strong>Vào bãi lúc:</strong> <br/>{formatDateTime(selectedSession.checkInTime)}</p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={styles.label}>Hình thức thanh toán</label>
                <select
                  style={styles.select}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="CASH">Tiền mặt (CASH)</option>
                  <option value="CARD">Quẹt thẻ ngân hàng (CARD)</option>
                  <option value="E_WALLET">Ví điện tử Momo/VNPAY</option>
                </select>
              </div>

              <button
                onClick={handleCheckOutSubmit}
                style={{ ...styles.btnAction, width: '100%', padding: '12px', fontSize: '15px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                Xác nhận thanh toán & Ra bãi
              </button>

              <button
                onClick={() => setSelectedSession(null)}
                style={{ width: '100%', background: '#fff', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '14px', marginTop: '10px', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8', margin: '40px 0' }}>
              Vui lòng chọn một xe đỗ trong danh sách bên trái để thực hiện check-out tính tiền.
            </p>
          )}
        </div>
      </div>

      {/* MODAL HÓA ĐƠN ĐẸP MẮT */}
      {invoiceData && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>HÓA ĐƠN THANH TOÁN</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>HỆ THỐNG QUẢN LÝ GỬI XE PBMS</p>
            </div>
            
            <div style={styles.invoiceDivider}></div>

            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
              <p style={{ margin: '4px 0' }}><strong>Biển Số Xe:</strong> {invoiceData.licensePlate}</p>
              <p style={{ margin: '4px 0' }}><strong>Mã Hóa Đơn:</strong> #{invoiceData.invoiceId}</p>
              <p style={{ margin: '4px 0' }}><strong>Thời Gian Vào:</strong> {formatDateTime(invoiceData.checkInTime)}</p>
              <p style={{ margin: '4px 0' }}><strong>Thời Gian Ra:</strong> {formatDateTime(invoiceData.checkOutTime)}</p>
              <p style={{ margin: '4px 0' }}><strong>Thời Gian Đỗ:</strong> {invoiceData.hours} giờ (làm tròn)</p>
              <p style={{ margin: '4px 0' }}><strong>Phương Thức:</strong> {invoiceData.paymentMethod}</p>
            </div>

            <div style={styles.invoiceDivider}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold' }}>TỔNG TIỀN:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                {formatCurrency(invoiceData.amount)}
              </span>
            </div>

            <div style={styles.invoiceDivider}></div>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', margin: '10px 0 0 0' }}>
              Cảm ơn quý khách đã sử dụng dịch vụ!
            </p>

            <button
              style={styles.btnModalClose}
              onClick={() => setInvoiceData(null)}
            >
              Đóng và Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckOutPage;
