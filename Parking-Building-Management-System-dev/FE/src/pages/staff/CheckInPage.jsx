import React, { useEffect, useState } from 'react';
import floorApi from '../../api/floorApi';
import slotApi from '../../api/slotApi';
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
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    backgroundColor: '#fff',
  },
  btnSubmit: {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'transform 0.1s',
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  slotCell: {
    padding: '12px 6px',
    borderRadius: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    border: '1px solid transparent',
    transition: 'all 0.2s',
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
  alertError: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  }
};

const CheckInPage = () => {
  const [floors, setFloors] = useState([]);
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [licensePlate, setLicensePlate] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Tải danh sách tầng
  useEffect(() => {
    floorApi.getAll()
      .then(res => {
        setFloors(res.data || res);
        if ((res.data || res).length > 0) {
          setSelectedFloorId((res.data || res)[0].id);
        }
      })
      .catch(err => console.error("Lỗi lấy tầng:", err));
  }, []);

  // 2. Tải danh sách chỗ đỗ xe khi chọn tầng
  useEffect(() => {
    if (selectedFloorId) {
      slotApi.getByFloorId(selectedFloorId)
        .then(res => {
          setSlots(res.data || res);
          setSelectedSlot(null); // Reset slot đã chọn
        })
        .catch(err => console.error("Lỗi lấy chỗ đỗ:", err));
    }
  }, [selectedFloorId]);

  // Xử lý gửi Check-in
  const handleCheckIn = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!licensePlate.trim()) {
      setError("Vui lòng nhập biển số xe.");
      return;
    }
    if (!selectedSlot) {
      setError("Vui lòng chọn một chỗ đỗ xe trống.");
      return;
    }

    const payload = {
      licensePlate: licensePlate.trim().toUpperCase(),
      slotId: selectedSlot.id
    };

    sessionApi.checkIn(payload)
      .then(res => {
        setSuccessMsg(`Check-in thành công xe ${payload.licensePlate} tại vị trí ${selectedSlot.slotCode}!`);
        setLicensePlate('');
        setSelectedSlot(null);
        // Tải lại slots của tầng hiện tại
        return slotApi.getByFloorId(selectedFloorId);
      })
      .then(res => {
        if (res) setSlots(res.data || res);
      })
      .catch(err => {
        const msg = err.response?.data?.message || "Lỗi khi thực hiện check-in.";
        setError(msg);
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý Vào bãi (Check-in)</h1>
        <p style={styles.subtitle}>Ghi nhận xe mới vào và chọn chỗ đỗ phù hợp</p>
      </div>

      {successMsg && <div style={styles.alertSuccess}>{successMsg}</div>}
      {error && <div style={styles.alertError}>{error}</div>}

      <div style={styles.flexRow}>
        {/* Form nhập thông tin */}
        <form onSubmit={handleCheckIn} style={styles.card}>
          <h2 style={{ fontSize: '17px', margin: '0 0 18px 0', color: '#1e293b' }}>Thông tin gửi xe</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Tầng đỗ xe</label>
            <select
              style={styles.select}
              value={selectedFloorId}
              onChange={(e) => setSelectedFloorId(e.target.value)}
            >
              <option value="" disabled>-- Chọn tầng gửi xe --</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>{floor.floorName}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Biển số xe</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Ví dụ: 30A-12345"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Vị trí đã chọn</label>
            <input
              style={{ ...styles.input, backgroundColor: '#f1f5f9', fontWeight: 'bold' }}
              type="text"
              readOnly
              value={selectedSlot ? `${selectedSlot.slotCode} (${selectedSlot.slotType})` : 'Chưa chọn'}
            />
          </div>

          <button type="submit" style={styles.btnSubmit}>
            Xác nhận cho xe vào
          </button>
        </form>

        {/* Sơ đồ bãi xe trực quan */}
        <div style={{ ...styles.card, flex: '2 1 500px' }}>
          <h2 style={{ fontSize: '17px', margin: '0 0 10px 0', color: '#1e293b' }}>Sơ đồ chỗ đỗ xe</h2>
          
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.dot, backgroundColor: '#10b981' }}></div>
              Trống (AVAILABLE)
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.dot, backgroundColor: '#ef4444' }}></div>
              Đang đỗ (OCCUPIED)
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.dot, backgroundColor: '#f59e0b' }}></div>
              Đã đặt (RESERVED)
            </div>
          </div>

          <div style={styles.slotGrid}>
            {slots.map(slot => {
              const isSelected = selectedSlot?.id === slot.id;
              let bgColor = '#f3f4f6';
              let color = '#9ca3af';
              let cursor = 'not-allowed';

              if (slot.status === 'AVAILABLE') {
                bgColor = isSelected ? '#10b981' : '#ecfdf5';
                color = isSelected ? '#fff' : '#047857';
                cursor = 'pointer';
              } else if (slot.status === 'OCCUPIED') {
                bgColor = '#fef2f2';
                color = '#b91c1c';
              } else if (slot.status === 'RESERVED') {
                bgColor = '#fffbeb';
                color = '#b45309';
                cursor = 'pointer'; // Khách đặt trước, nhân viên click để cho xe vào
              }

              return (
                <div
                  key={slot.id}
                  style={{
                    ...styles.slotCell,
                    backgroundColor: bgColor,
                    color: color,
                    cursor: cursor,
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    boxShadow: isSelected ? '0 4px 10px rgba(16, 185, 129, 0.4)' : 'none',
                    border: isSelected ? '1px solid #10b981' : '1px solid transparent'
                  }}
                  onClick={() => {
                    if (slot.status === 'AVAILABLE' || slot.status === 'RESERVED') {
                      setSelectedSlot(slot);
                    }
                  }}
                >
                  <div style={{ fontSize: '14px' }}>{slot.slotCode}</div>
                  <div style={{ fontSize: '9px', fontWeight: 500, opacity: 0.8, marginTop: '2px' }}>
                    {slot.slotType}
                  </div>
                </div>
              );
            })}
          </div>

          {slots.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30px' }}>
              Không có chỗ đỗ xe nào được cấu hình ở tầng này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
