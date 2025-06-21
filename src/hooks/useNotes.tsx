
import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { getNotesFromDrive, saveNotesToDrive } from "@/lib/drive";
import { toast } from "sonner";

export const useNotes = (user: any, accessToken: string | null) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (user && accessToken) {
        setIsLoadingNotes(true);
        try {
          const savedNotes = await getNotesFromDrive(accessToken);
          setNotes(savedNotes);
        } catch (error: any) {
          console.error("Failed to fetch notes:", error);
          toast.error("Failed to load notes", { description: error.message || "Could not retrieve your notes from Google Drive." });
        } finally {
          setIsLoadingNotes(false);
        }
      }
    };
    fetchNotes();
  }, [user, accessToken]);

  const addNote = async (note: Note) => {
    if (!user || !accessToken) return;
    const originalNotes = notes;
    const newNotes = [note, ...notes];
    setNotes(newNotes);
    try {
      await saveNotesToDrive(accessToken, newNotes);
      toast.success("Note saved!", { description: "Your new note has been saved to Google Drive." });
    } catch (error: any) {
      setNotes(originalNotes);
      toast.error("Failed to save note", { description: error.message || "Could not save the note to Google Drive." });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user || !accessToken) return;
    const originalNotes = notes;
    const newNotes = notes.filter((note) => note.id !== noteId);
    setNotes(newNotes);
    try {
      await saveNotesToDrive(accessToken, newNotes);
      toast.info("Note deleted", { description: "The note has been removed from your Google Drive." });
    } catch (error: any) {
      setNotes(originalNotes);
      toast.error("Failed to delete note", { description: error.message || "Could not remove the note from Google Drive." });
    }
  };

  const updateNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
  };

  return {
    notes,
    isLoadingNotes,
    addNote,
    deleteNote,
    updateNotes
  };
};
