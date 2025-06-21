import { useState, useEffect } from "react";
import CameraView from "@/components/CameraView";
import NotesList from "@/components/NotesList";
import CalendarView from "@/components/CalendarView";
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Camera, BookOpen, LogOut, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import { UserProfile, getUser, saveUser, logout as logoutUser, saveAccessToken, getAccessToken } from '@/lib/auth';
import { getNotesFromDrive, saveNotesToDrive } from "@/lib/drive";
import { toast } from "sonner";
import LandingPage from "@/components/LandingPage";

// Replace this URL with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzc1X1Tn7W8Mpfy5OQY1F8Le_kvzFxiaHhoQI6v0w1oH-wk9nHwcTdUa38TlgZmtsI/exec";

const GEMINI_API_KEY = "AIzaSyBut-K44X83hTQZ5OVx9ccbHGvJyAgPUpg";

const Index = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<"camera" | "notes" | "calendar">("camera");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [imageQueue, setImageQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loggedInUser = getUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      const storedToken = getAccessToken();
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, []);

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
      setNotes(newNotes);

      try {
        await saveNotesToDrive(tempAccessToken, newNotes);
        toast.success("Note created!", { description: "Your new note has been generated from your image." });
      } catch (saveError: any) {
        setNotes(previousNotes); // Rollback
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

  const handleLoginSuccess = async (tokenResponse: any) => {
    const token = tokenResponse.access_token;
    saveAccessToken(token);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      const profile = await res.json();
      const newUser: UserProfile = {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      };
      saveUser(newUser);
      setUser(newUser);
      setAccessToken(token);
    } catch(err) {
      console.error("Failed to fetch user profile", err);
      toast.error("Failed to log in.", { description: "Could not fetch your user profile from Google." });
    }
  };
  
  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: (error) => {
      console.log('Login Failed:', error);
      toast.error("Login Failed", { description: "There was an issue signing in with Google." });
    },
    scope: 'https://www.googleapis.com/auth/drive.appdata',
  });
  
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setNotes([]);
    setAccessToken(null);
  };

  const queueNoteForProcessing = (imageDataUrl: string) => {
    setImageQueue(prevQueue => [...prevQueue, imageDataUrl]);
    setView("notes");
    toast.info("Image captured!", {
      description: "Your note is being created in the background.",
    });
  };

  const addNote = async (note: Note) => {
    if (!user || !accessToken) return;
    const originalNotes = notes;
    const newNotes = [note, ...notes];
    setNotes(newNotes);
    setView("notes");
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

  if (!user) {
    return <LandingPage onLogin={() => login()} />;
  }

  const renderContent = () => {
    if (isLoadingNotes) {
      return (
        <div className="flex-1 flex items-center justify-center text-center">
            <div>
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading notes from Google Drive...</p>
            </div>
        </div>
      );
    }
    
    if (view === "camera") {
      return <CameraView queueNoteForProcessing={queueNoteForProcessing} />;
    }

    if (view === "calendar") {
      return <CalendarView notes={notes} appsScriptUrl={APPS_SCRIPT_URL} />;
    }
    
    return <NotesList notes={notes} deleteNote={deleteNote} isProcessing={isProcessing} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex justify-between items-center border-b border-border/50 bg-background/50 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold text-primary">Visual Notes AI</h1>
        <div className="flex gap-4 items-center">
            <div className="flex gap-2">
                <Button variant={view === "camera" ? "default" : "outline"} size="icon" onClick={() => setView("camera")}>
                    <Camera className="h-4 w-4" />
                </Button>
                <Button variant={view === "notes" ? "default" : "outline"} size="icon" onClick={() => setView("notes")}>
                    <BookOpen className="h-4 w-4" />
                </Button>
                <Button variant={view === "calendar" ? "default" : "outline"} size="icon" onClick={() => setView("calendar")}>
                    <CalendarIcon className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
            </div>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
