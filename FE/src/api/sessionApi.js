import axiosClient from './axiosClient';

const sessionApi = {
  getAll: () => {
    return axiosClient.get('/sessions');
  },
};

export default sessionApi;
