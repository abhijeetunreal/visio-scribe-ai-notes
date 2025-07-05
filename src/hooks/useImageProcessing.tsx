
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

    console.log('Starting image processing...');
    console.log('Apps Script URL:', APPS_SCRIPT_URL);
    console.log('Image data size:', base64ImageData.length);

    try {
      console.log('Making request to Apps Script...');
      
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
        mode: 'cors'
      });

      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

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
        console.error('Save error:', saveError);
        updateNotes(previousNotes); // Rollback
        toast.error("Failed to save note", {
          description: saveError.message || "Couldn't save to Google Drive."
        });
      }

    } catch (err: any) {
      console.error("Failed to process image:", err);
      
      // More specific error messages
      let errorMessage = "Could not create note from image.";
      if (err.message.includes('NetworkError')) {
        errorMessage = "Network error: Please check your internet connection and ensure the Apps Script is properly deployed.";
      } else if (err.message.includes('CORS')) {
        errorMessage = "Cross-origin error: The Apps Script may not be configured properly.";
      } else if (err.message.includes('HTTP')) {
        errorMessage = `Server error: ${err.message}`;
      }
      
      toast.error("Processing Failed", { 
        description: errorMessage,
        duration: 5000
      });
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
    console.log('Queueing image for processing...');
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
