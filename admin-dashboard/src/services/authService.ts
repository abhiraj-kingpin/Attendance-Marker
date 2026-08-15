import { api } from './apiService';
import type { AdminUser } from '../types';

export async function login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}

export async function fetchMe(): Promise<AdminUser> {
  const { data } = await api.get('/api/auth/me');
  return data;
}
