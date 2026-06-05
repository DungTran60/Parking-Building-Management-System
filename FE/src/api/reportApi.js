import axiosClient from './axiosClient';

const reportApi = {
  getSummary: () => {
    return axiosClient.get('/reports/summary');
  },
};

export default reportApi;
