import axiosClient from './axiosClient';

/**
 * API client cho Floor (Tầng gửi xe) - tương ứng với các endpoint:
 * GET    /api/floors
 * GET    /api/floors/:id
 * POST   /api/floors
 * PUT    /api/floors/:id
 * DELETE /api/floors/:id
 */
const floorApi = {
  /** Lấy toàn bộ danh sách tầng gửi xe */
  getAll: () => {
    return axiosClient.get('/floors');
  },

  /** Lấy một tầng theo ID */
  getById: (id) => {
    return axiosClient.get(`/floors/${id}`);
  },

  /** Tạo mới một tầng */
  create: (data) => {
    return axiosClient.post('/floors', data);
  },

  /** Cập nhật một tầng theo ID */
  update: (id, data) => {
    return axiosClient.put(`/floors/${id}`, data);
  },

  /** Xóa một tầng theo ID */
  remove: (id) => {
    return axiosClient.delete(`/floors/${id}`);
  },
};

export default floorApi;
