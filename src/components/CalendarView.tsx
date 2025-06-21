import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { isSameDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CalendarViewProps {
  notes: Note[];
  proxyUrl: {PROXY_URL}; // Changed from apiKey to proxyUrl
}

const CalendarView = ({ notes, proxyUrl }: CalendarViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dailyNotes, setDailyNotes] = useState<Note[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date) {
      const notesForDay = notes.filter((note) =>
        isSameDay(new Date(note.createdAt), date)
      );
      setDailyNotes(notesForDay);

      if (notesForDay.length > 0) {
        generateSummary(notesForDay);
      } else {
        setSummary('');
      }
    }
  }, [date, notes]);

  const generateSummary = async (notesForDay: Note[]) => {
    setIsLoadingSummary(true);
    setError(null);
    setSummary('');

    const notesText = notesForDay.map((note) => `- ${note.text}`).join('\n');
    const prompt = `Based on the following notes, provide a concise and insightful summary of the day's events and observations.\n\nNotes:\n${notesText}`;

    try {
      // Call your Apps Script proxy URL
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prompt, // Send text instead of image
          maxTokens: 300
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary. Server responded with ' + response.status);
      }

      const data = await response.json();
      
      // Handle proxy errors
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Handle Gemini-specific errors
      if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Request blocked: ${data.promptFeedback.blockReason}`);
      }
      
      const generatedSummary = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedSummary) {
        setSummary(generatedSummary);
      } else {
        throw new Error("Could not extract summary from API response.");
      }
    } catch (err: any) {
      console.error("Summary generation error:", err);
      setError(err.message || "An unexpected error occurred while generating the summary.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 h-full">
      <div className="flex justify-center items-start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border bg-card/50 backdrop-blur-sm"
        />
      </div>
      <div className="overflow-y-auto">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>
              Summary for {date ? date.toLocaleDateString() : '...'}
            </CardTitle>
            <CardDescription>
              AI-generated summary based on your notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dailyNotes.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">AI Summary</h3>
                  {isLoadingSummary && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin"/>
                      Generating...
                    </div>
                  )}
                  {error && (
                    <div className="text-destructive p-3 bg-destructive/10 rounded-md">
                      <p className="font-medium">Error generating summary</p>
                      <p className="text-sm">{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => generateSummary(dailyNotes)}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                  {summary && <p className="text-muted-foreground whitespace-pre-wrap bg-accent/20 p-4 rounded-md">{summary}</p>}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Notes for the day</h3>
                  <div className="space-y-4">
                    {dailyNotes.map(note => (
                       <Card key={note.id} className="flex gap-4 p-4">
                         <img 
                           src={note.image} 
                           alt="Note" 
                           className="w-24 h-24 object-cover rounded-md"
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.onerror = null;
                             target.classList.add('hidden');
                           }}
                         />
                         <div className="flex-1">
                           <p className="text-sm text-foreground">{note.text}</p>
                           <p className="text-xs text-muted-foreground mt-2">
                             {new Date(note.createdAt).toLocaleTimeString([], {
                               hour: '2-digit', 
                               minute: '2-digit'
                             })}
                           </p>
                         </div>
                       </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-accent/20 rounded-full p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <p className="text-muted-foreground">No notes found for this day.</p>
                <p className="text-sm text-muted-foreground mt-2">Capture notes using the camera to see them here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;