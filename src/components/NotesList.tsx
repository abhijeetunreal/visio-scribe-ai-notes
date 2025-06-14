
import { Note } from "@/types";
import NoteView from "./NoteView";

interface NotesListProps {
  notes: Note[];
}

const NotesList = ({ notes }: NotesListProps) => {
  if (notes.length === 0) {
    return (
      <div className="text-center flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">You haven't taken any notes yet. Go to the camera view to capture your first visual note!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteView key={note.id} note={note} />
      ))}
    </div>
  );
};

export default NotesList;
