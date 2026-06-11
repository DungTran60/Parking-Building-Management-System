import React, { useEffect, useState } from 'react';
import reportApi from '../../api/reportApi';

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
  gridStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '110px',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  },
  cardBlue: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  cardOrange: {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
  },
  cardGreen: {
    background: 'linear-gradient(135deg, #10b981, #047857)',
  },
  cardPurple: {
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: 600,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: 800,
  },
  flexLayout: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  tableCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    flex: '2 1 600px',
  },
  sideCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    flex: '1 1 300px',
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
};

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    activeVehicles: 0,
    totalSlots: 0,
    occupiedSlots: 0,
    occupancyRate: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tải báo cáo tổng hợp và doanh thu theo ngày
    Promise.all([
      reportApi.getSummary(),
      reportApi.getByDate()
    ])
      .then(([summaryRes, dailyRes]) => {
        setSummary(summaryRes.data || summaryRes);
        setRevenueData(dailyRes.data || dailyRes);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu báo cáo:", err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Inter' }}>Đang tải dữ liệu báo cáo...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Bảng thống kê (Dashboard)</h1>
        <p style={styles.subtitle}>Cập nhật số liệu hoạt động, doanh thu và tỷ lệ trống bãi đỗ xe theo thời gian thực</p>
      </div>

      {/* Grid Stats */}
      <div style={styles.gridStats}>
        <div style={{ ...styles.statCard, ...styles.cardBlue }}>
          <span style={styles.statLabel}>Tổng Doanh Thu</span>
          <span style={styles.statValue}>{formatCurrency(summary.totalRevenue)}</span>
        </div>

        <div style={{ ...styles.statCard, ...styles.cardOrange }}>
          <span style={styles.statLabel}>Xe Đang Đỗ</span>
          <span style={styles.statValue}>{summary.activeVehicles} xe</span>
        </div>

        <div style={{ ...styles.statCard, ...styles.cardGreen }}>
          <span style={styles.statLabel}>Chỗ Đỗ Còn Trống</span>
          <span style={styles.statValue}>
            {summary.totalSlots - summary.occupiedSlots} / {summary.totalSlots}
          </span>
        </div>

        <div style={{ ...styles.statCard, ...styles.cardPurple }}>
          <span style={styles.statLabel}>Tỷ Lệ Lấp Đầy</span>
          <span style={styles.statValue}>{summary.occupancyRate}%</span>
        </div>
      </div>

      <div style={styles.flexLayout}>
        {/* Doanh thu theo ngày */}
        <div style={styles.tableCard}>
          <h2 style={{ fontSize: '16px', margin: '0 0 14px 0', fontWeight: 700, color: '#1e293b' }}>
            Doanh thu gửi xe theo ngày
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ngày gửi xe</th>
                  <th style={styles.th}>Số lượt thanh toán</th>
                  <th style={styles.th}>Doanh thu thu về</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{row.date}</td>
                    <td style={styles.td}>{row.count} lượt</td>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
                {revenueData.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                      Chưa ghi nhận hóa đơn thanh toán nào trong bãi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trạng thái chỗ đỗ hiện tại */}
        <div style={styles.sideCard}>
          <h2 style={{ fontSize: '16px', margin: '0 0 14px 0', fontWeight: 700, color: '#1e293b' }}>
            Tổng quan bãi đỗ
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Tổng số chỗ đỗ xe:</span>
              <span style={{ fontWeight: 600 }}>{summary.totalSlots}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Chỗ đỗ đã lấp đầy:</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>{summary.occupiedSlots}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Tỉ lệ trống hiện tại:</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>
                {Math.max(0, 100 - summary.occupancyRate)}%
              </span>
            </div>
            
            {/* Vẽ thanh tiến trình đơn giản */}
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginTop: '10px' }}>
              <div style={{ width: `${summary.occupancyRate}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '5px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
