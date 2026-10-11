import apiClient from './axios';
import { ApiResponse } from '../types/api';
import { AuthResponseData, LoginCredentials, RegisterCredentials, User } from '../types/user';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', credentials);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};
