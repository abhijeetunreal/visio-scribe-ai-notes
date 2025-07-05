
import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { toast } from "sonner";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzc1X1Tn7W8Mpfy5OQY1F8Le_kvzFxiaHhoQI6v0w1oH-wk9nHwcTdUa38TlgZmtsI/exec";

export const useImageProcessing = (
  accessToken: string | null,
  notes: Note[],
  updateNotes: (notes: Note[]) => void
) => {
  const [imageQueue, setImageQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processNextInQueue = async () => {
    if (imageQueue.length === 0 || !accessToken) return;

    setIsProcessing(true);
    const imageDataUrl = imageQueue[0];
    const base64ImageData = imageDataUrl.split(',')[1];
    const tempAccessToken = accessToken;

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyzeImage',
          imageData: base64ImageData,
          prompt: 'Describe what you see in this image in a detailed but concise way, as if you were taking a note. Focus on the main subject and key details of the environment.'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image.');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const description = data.result;

      if (!description) {
        throw new Error("Failed to get a description from the image. The API response might be empty or invalid.");
      }

      const newNote: Note = {
        id: new Date().toISOString(),
        image: imageDataUrl,
        text: description,
        createdAt: new Date().toISOString(),
      };

      const previousNotes = notes;
      const newNotes = [newNote, ...previousNotes];
      updateNotes(newNotes);

      try {
        const { saveNotesToDrive } = await import("@/lib/drive");
        await saveNotesToDrive(tempAccessToken, newNotes);
        toast.success("Note created!", { description: "Your new note has been generated from your image." });
      } catch (saveError: any) {
        updateNotes(previousNotes); // Rollback
        toast.error("Failed to save note", {
          description: saveError.message || "Couldn't save to Google Drive."
        });
      }

    } catch (err: any) {
      console.error("Failed to process image:", err);
      toast.error("Processing Failed", { description: err.message || "Could not create note from image." });
    } finally {
      setImageQueue(prevQueue => prevQueue.slice(1));
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    if (imageQueue.length > 0 && !isProcessing && accessToken) {
      processNextInQueue();
    }
  }, [imageQueue, isProcessing, accessToken]);

  const queueNoteForProcessing = (imageDataUrl: string) => {
    setImageQueue(prevQueue => [...prevQueue, imageDataUrl]);
    toast.info("Image captured!", {
      description: "Your note is being created in the background.",
    });
  };

  return {
    isProcessing,
    queueNoteForProcessing
  };
};
