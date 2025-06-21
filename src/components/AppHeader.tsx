
import { Button } from "@/components/ui/button";
import { Camera, BookOpen, LogOut, Calendar as CalendarIcon } from "lucide-react";
import { UserProfile } from '@/lib/auth';

interface AppHeaderProps {
  user: UserProfile;
  view: "camera" | "notes" | "calendar";
  setView: (view: "camera" | "notes" | "calendar") => void;
  handleLogout: () => void;
}

const AppHeader = ({ user, view, setView, handleLogout }: AppHeaderProps) => {
  return (
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
  );
};

export default AppHeader;
