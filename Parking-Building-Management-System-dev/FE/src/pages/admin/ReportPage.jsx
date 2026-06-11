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
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  input: {
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    width: '200px',
  },
  select: {
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    backgroundColor: '#fff',
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
  badgePaid: {
    display: 'inline-block',
    background: '#e6fffa',
    color: '#047857',
    borderRadius: '20px',
    padding: '3px 12px',
    fontSize: '13px',
    fontWeight: 600,
  },
  badgeUnpaid: {
    display: 'inline-block',
    background: '#fff5f5',
    color: '#c53030',
    borderRadius: '20px',
    padding: '3px 12px',
    fontSize: '13px',
    fontWeight: 600,
  }
};

const ReportPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchSessionId, setSearchSessionId] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Tải danh sách hóa đơn
  useEffect(() => {
    pricingApi.getInvoices()
      .then(res => {
        setInvoices(res.data || res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách hóa đơn:", err);
        setLoading(false);
      });
  }, []);

  // Lọc dữ liệu hóa đơn
  const filteredInvoices = invoices.filter(invoice => {
    const matchPayment = paymentFilter === '' || invoice.paymentMethod === paymentFilter;
    const matchSession = searchSessionId === '' || String(invoice.sessionId).includes(searchSessionId);
    return matchPayment && matchSession;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDateTime = (timestampStr) => {
    if (!timestampStr) return '-';
    return new Date(timestampStr).toLocaleString('vi-VN');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Inter' }}>Đang tải danh sách báo cáo hóa đơn...</div>;
  }

  // Tính tổng doanh thu sau khi lọc
  const filteredTotalRevenue = filteredInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Danh sách Hóa đơn & Báo cáo</h1>
        <p style={styles.subtitle}>Xem chi tiết các giao dịch thanh toán gửi xe của khách hàng trong hệ thống</p>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', margin: '0', color: '#1e293b' }}>Hóa đơn giao dịch</h2>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#047857' }}>
            Tổng doanh thu (lọc): {formatCurrency(filteredTotalRevenue)}
          </div>
        </div>

        {/* Thanh lọc */}
        <div style={styles.filterBar}>
          <input
            style={styles.input}
            type="text"
            placeholder="🔍 Tìm theo Session ID..."
            value={searchSessionId}
            onChange={(e) => setSearchSessionId(e.target.value)}
          />

          <select
            style={styles.select}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Tất cả hình thức</option>
            <option value="CASH">Tiền mặt (CASH)</option>
            <option value="CARD">Quẹt thẻ ngân hàng (CARD)</option>
            <option value="E_WALLET">Ví điện tử Momo/VNPAY</option>
          </select>
        </div>

        {/* Bảng dữ liệu */}
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID Hóa đơn</th>
                <th style={styles.th}>Session ID</th>
                <th style={styles.th}>Số tiền thanh toán</th>
                <th style={styles.th}>Phương thức</th>
                <th style={styles.th}>Thời gian thanh toán</th>
                <th style={styles.th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td style={{ ...styles.td, fontWeight: 'bold' }}>#{invoice.id}</td>
                  <td style={styles.td}>{invoice.sessionId}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#10b981' }}>
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td style={styles.td}>{invoice.paymentMethod}</td>
                  <td style={styles.td}>{formatDateTime(invoice.paymentTime)}</td>
                  <td style={styles.td}>
                    <span style={invoice.status === 'PAID' ? styles.badgePaid : styles.badgeUnpaid}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy hóa đơn nào khớp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
