import axiosClient from './axiosClient';

const authApi = {
  login: (credentials) => {
    return axiosClient.post('/auth/login', credentials);
  },
  register: (userData) => {
    return axiosClient.post('/auth/register', userData);
  },
  logout: () => {
    return axiosClient.post('/auth/logout');
  },
};

export default authApi;
