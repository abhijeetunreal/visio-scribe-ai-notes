
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { useImageProcessing } from "@/hooks/useImageProcessing";
import { Note } from "@/types";
import LandingPage from "@/components/LandingPage";
import AppHeader from "@/components/AppHeader";
import MainContent from "@/components/MainContent";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzc1X1Tn7W8Mpfy5OQY1F8Le_kvzFxiaHhoQI6v0w1oH-wk9nHwcTdUa38TlgZmtsI/exec";

const Index = () => {
  const { user, accessToken, login, handleLogout } = useAuth();
  const { notes, isLoadingNotes, addNote, deleteNote, updateNotes } = useNotes(user, accessToken);
  const { isProcessing, queueNoteForProcessing } = useImageProcessing(accessToken, notes, updateNotes);
  const [view, setView] = useState<"camera" | "notes" | "calendar">("camera");

  const handleQueueNoteForProcessing = (imageDataUrl: string) => {
    queueNoteForProcessing(imageDataUrl);
    setView("notes");
  };

  const handleLogoutWithReset = () => {
    handleLogout();
    updateNotes([]);
  };

  if (!user) {
    return <LandingPage onLogin={() => login()} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader 
        user={user} 
        view={view} 
        setView={setView} 
        handleLogout={handleLogoutWithReset} 
      />
      <main className="flex-1 flex flex-col p-4 md:p-8">
        <MainContent
          view={view}
          isLoadingNotes={isLoadingNotes}
          notes={notes}
          deleteNote={deleteNote}
          isProcessing={isProcessing}
          queueNoteForProcessing={handleQueueNoteForProcessing}
          appsScriptUrl={APPS_SCRIPT_URL}
        />
      </main>
    </div>
  );
};

export default Index;
