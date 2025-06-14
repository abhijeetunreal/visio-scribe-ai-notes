
import { Note } from "@/types";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export const saveUser = (user: UserProfile) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): UserProfile | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('user');
};
