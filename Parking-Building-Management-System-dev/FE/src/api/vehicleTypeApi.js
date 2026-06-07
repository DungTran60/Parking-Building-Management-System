import axiosClient from './axiosClient';

/**
 * API client cho Vehicle Type - tương ứng với các endpoint:
 * GET    /api/vehicle-types
 * GET    /api/vehicle-types/:id
 * POST   /api/vehicle-types
 * PUT    /api/vehicle-types/:id
 * DELETE /api/vehicle-types/:id
 */
const vehicleTypeApi = {
  /** Lấy toàn bộ danh sách loại phương tiện */
  getAll: () => {
    return axiosClient.get('/vehicle-types');
  },

  /** Lấy một loại phương tiện theo ID */
  getById: (id) => {
    return axiosClient.get(`/vehicle-types/${id}`);
  },

  /** Tạo mới một loại phương tiện */
  create: (data) => {
    return axiosClient.post('/vehicle-types', data);
  },

  /** Cập nhật một loại phương tiện theo ID */
  update: (id, data) => {
    return axiosClient.put(`/vehicle-types/${id}`, data);
  },

  /** Xóa một loại phương tiện theo ID */
  remove: (id) => {
    return axiosClient.delete(`/vehicle-types/${id}`);
  },
};

export default vehicleTypeApi;
