import axiosClient from './axiosClient';

const pricingApi = {
  /** Lấy danh sách chính sách giá của bãi xe */
  getPricing: () => {
    return axiosClient.get('/payments/pricing');
  },

  /** Cập nhật chính sách giá gửi xe */
  updatePricing: (data) => {
    return axiosClient.put('/payments/pricing', data);
  },

  /** Lấy danh sách hóa đơn */
  getInvoices: () => {
    return axiosClient.get('/payments/invoices');
  },
};

export default pricingApi;
