
import { Note } from "@/types";
import NoteView from "./NoteView";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
    <div className="w-full flex justify-center">
      <Carousel
        plugins={[
          // Using `as any` to bypass a TypeScript type mismatch issue between embla-carousel versions.
          // This does not affect runtime behavior.
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }) as any,
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-sm md:max-w-xl lg:max-w-4xl xl:max-w-6xl"
      >
        <CarouselContent>
          {isProcessing && (
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <NoteSkeleton />
              </div>
            </CarouselItem>
          )}
          {notes.map((note) => (
            <CarouselItem key={note.id} className="md:basis-1/2 lg:basis-1/3 animate-scale-in">
              <div className="p-2">
                <NoteView note={note} deleteNote={deleteNote} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default NotesList;
