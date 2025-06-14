
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

export const saveNotes = (userId: string, notes: Note[]) => {
  localStorage.setItem(`notes_${userId}`, JSON.stringify(notes));
};

export const getNotes = (userId: string): Note[] => {
  const notesStr = localStorage.getItem(`notes_${userId}`);
  if (notesStr) {
    try {
      return JSON.parse(notesStr);
    } catch (e) {
      console.error("Failed to parse notes from localStorage", e);
      return [];
    }
  }
  return [];
};
