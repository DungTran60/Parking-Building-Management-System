import axiosClient from './axiosClient';

const slotApi = {
  getAll: () => {
    return axiosClient.get('/slots');
  },
  getById: (id) => {
    return axiosClient.get(`/slots/${id}`);
  },
};

export default slotApi;
