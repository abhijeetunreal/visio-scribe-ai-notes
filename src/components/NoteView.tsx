
import { useState } from 'react';
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface NoteViewProps {
  note: Note;
}

const NoteView = ({ note }: NoteViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="aspect-video rounded-md overflow-hidden">
          <img src={note.image} alt="Visual note" className="w-full h-full object-cover" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-foreground">{note.text}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={speak} variant="outline" size="icon" disabled={isSpeaking && !window.speechSynthesis.speaking}>
          {isSpeaking ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoteView;
