
import { useState, useEffect } from "react";
import CameraView from "@/components/CameraView";
import NotesList from "@/components/NotesList";
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Camera, BookOpen, LogOut } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import { UserProfile, getUser, saveUser, logout as logoutUser, getNotes, saveNotes } from '@/lib/auth';

const GEMINI_API_KEY = "AIzaSyBut-K44X83hTQZ5OVx9ccbHGvJyAgPUpg";

const Index = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<"camera" | "notes">("camera");

  useEffect(() => {
    const loggedInUser = getUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      const savedNotes = getNotes(loggedInUser.id);
      setNotes(savedNotes);
    }
  }, []);

  const handleLoginSuccess = async (tokenResponse: any) => {
    const accessToken = tokenResponse.access_token;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
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
    } catch(err) {
      console.error("Failed to fetch user profile", err);
    }
  };
  
  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: (error) => console.log('Login Failed:', error)
  });
  
  const handleLogout = () => {
    if (user) {
      localStorage.removeItem(`notes_${user.id}`);
      logoutUser();
      setUser(null);
      setNotes([]);
    }
  };

  const addNote = (note: Note) => {
    if (!user) return;
    const newNotes = [note, ...notes];
    setNotes(newNotes);
    saveNotes(user.id, newNotes);
    setView("notes");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Visual Notes AI</h1>
          <p className="text-muted-foreground mb-8">Capture your thoughts visually. Login to start.</p>
          <Button onClick={() => login()} size="lg">
            <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 282.6 92 256 92c-71.7 0-129.9 58.2-129.9 130s58.2 130 129.9 130c79.4 0 114.2-62.8 118.9-97.4H256v-78.4h231.9c4.7 26.5 7.1 54.4 7.1 82.8z"></path></svg>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
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
        {view === "camera" ? (
          <CameraView addNote={addNote} apiKey={GEMINI_API_KEY} />
        ) : (
          <NotesList notes={notes} />
        )}
      </main>
    </div>
  );
};

export default Index;
