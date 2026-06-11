import axiosClient from './axiosClient';

const reportApi = {
  /** Lấy thống kê tổng quan cho dashboard */
  getSummary: () => {
    return axiosClient.get('/manager/reports/summary');
  },

  /** Lấy doanh thu thống kê theo ngày */
  getByDate: () => {
    return axiosClient.get('/manager/reports/by-date');
  },
};

export default reportApi;
