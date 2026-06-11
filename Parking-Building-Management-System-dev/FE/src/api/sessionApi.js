import axiosClient from './axiosClient';

const sessionApi = {
  /** Lấy danh sách xe đang đỗ trong bãi */
  getActive: () => {
    return axiosClient.get('/staff/sessions/active');
  },

  /** Thực hiện check-in cho xe vào */
  checkIn: (data) => {
    return axiosClient.post('/staff/check-in', data);
  },

  /** Thực hiện check-out cho xe ra */
  checkOut: (data) => {
    return axiosClient.post('/staff/check-out', data);
  },

  /** Lấy lịch sử gửi xe của User khách hàng */
  getHistory: (userId) => {
    return axiosClient.get(`/driver/history/${userId}`);
  },
};

export default sessionApi;
