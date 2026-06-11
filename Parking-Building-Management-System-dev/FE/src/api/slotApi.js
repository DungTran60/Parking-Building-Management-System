import axiosClient from './axiosClient';

const slotApi = {
  /** Lấy toàn bộ chỗ đỗ xe trong bãi */
  getAll: () => {
    return axiosClient.get('/staff/slots');
  },

  /** Lấy danh sách các chỗ đỗ xe còn trống */
  getAvailable: () => {
    return axiosClient.get('/staff/slots/available');
  },

  /** Lấy danh sách chỗ đỗ xe thuộc một tầng cụ thể */
  getByFloorId: (floorId) => {
    return axiosClient.get(`/staff/slots/floor/${floorId}`);
  },
};

export default slotApi;
