import api from './api';

export const authService = {
  async register(username, email, password) {
    const { data } = await api.post('/auth/register', { username, email, password });
    if (data.token) {
      localStorage.setItem('regexmind_token', data.token);
      localStorage.setItem('regexmind_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('regexmind_token', data.token);
      localStorage.setItem('regexmind_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout() {
    localStorage.removeItem('regexmind_token');
    localStorage.removeItem('regexmind_user');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('regexmind_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('regexmind_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('regexmind_token');
  },
};
