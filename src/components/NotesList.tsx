
import { Note } from "@/types";
import NoteView from "./NoteView";
import { Skeleton } from "@/components/ui/skeleton";

interface NotesListProps {
  notes: Note[];
  deleteNote: (noteId: string) => void;
  isProcessing: boolean;
}

const NoteSkeleton = () => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
);


const NotesList = ({ notes, deleteNote, isProcessing }: NotesListProps) => {
  if (notes.length === 0 && !isProcessing) {
    return (
      <div className="text-center flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">You haven't taken any notes yet. Go to the camera view to capture your first visual note!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isProcessing && <NoteSkeleton />}
      {notes.map((note) => (
        <NoteView key={note.id} note={note} deleteNote={deleteNote} />
      ))}
    </div>
  );
};

export default NotesList;
