
import { useState } from "react";
import CameraView from "@/components/CameraView";
import NotesList from "@/components/NotesList";
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Camera, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<"camera" | "notes">("camera");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const addNote = (note: Note) => {
    setNotes((prevNotes) => [note, ...prevNotes]);
    setView("notes");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex justify-between items-center border-b border-border/50 bg-background/50 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold text-primary">Visual Notes AI</h1>
        <div className="flex gap-2">
          <Button variant={view === "camera" ? "default" : "outline"} size="icon" onClick={() => setView("camera")}>
            <Camera className="h-4 w-4" />
          </Button>
          <Button variant={view === "notes" ? "default" : "outline"} size="icon" onClick={() => setView("notes")}>
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-8">
        {!apiKey ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
              <p className="text-muted-foreground mb-4">
                To get started, please enter your OpenAI API key. This is required to analyze images and generate descriptions. Your key is not stored on any server.
              </p>
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="mt-1"
              />
            </div>
          </div>
        ) : view === "camera" ? (
          <CameraView addNote={addNote} apiKey={apiKey} />
        ) : (
          <NotesList notes={notes} />
        )}
      </main>
    </div>
  );
};

export default Index;
