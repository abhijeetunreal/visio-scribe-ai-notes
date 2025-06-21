
import { Loader2 } from "lucide-react";
import CameraView from "@/components/CameraView";
import NotesList from "@/components/NotesList";
import CalendarView from "@/components/CalendarView";
import { Note } from "@/types";

interface MainContentProps {
  view: "camera" | "notes" | "calendar";
  isLoadingNotes: boolean;
  notes: Note[];
  deleteNote: (noteId: string) => void;
  isProcessing: boolean;
  queueNoteForProcessing: (imageDataUrl: string) => void;
  appsScriptUrl: string;
}

const MainContent = ({
  view,
  isLoadingNotes,
  notes,
  deleteNote,
  isProcessing,
  queueNoteForProcessing,
  appsScriptUrl
}: MainContentProps) => {
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
    return <CalendarView notes={notes} appsScriptUrl={appsScriptUrl} />;
  }
  
  return <NotesList notes={notes} deleteNote={deleteNote} isProcessing={isProcessing} />;
};

export default MainContent;
