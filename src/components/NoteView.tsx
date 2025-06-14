
import { useState } from 'react';
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NoteViewProps {
  note: Note;
  deleteNote: (noteId: string) => void;
}

const NoteView = ({ note, deleteNote }: NoteViewProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(note.text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = () => {
    deleteNote(note.id);
  };

  return (
    <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="aspect-video rounded-md overflow-hidden mb-2">
          <img src={note.image} alt="Visual note" className="w-full h-full object-cover" />
        </div>
        <CardDescription>{new Date(note.createdAt).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-foreground">{note.text}</p>
      </CardContent>
      <CardFooter className="w-full flex justify-between items-center">
        <Button onClick={speak} variant="outline" size="icon" disabled={isSpeaking && !window.speechSynthesis.speaking}>
          {isSpeaking ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this note
                from your Google Drive.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default NoteView;
