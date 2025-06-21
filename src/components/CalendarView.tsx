import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { isSameDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CalendarViewProps {
  notes: Note[];
  proxyUrl: "https://script.google.com/macros/s/AKfycbzc1X1Tn7W8Mpfy5OQY1F8Le_kvzFxiaHhoQI6v0w1oH-wk9nHwcTdUa38TlgZmtsI/exec"; // Changed from apiKey to proxyUrl
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
      // Call Apps Script proxy instead of Gemini directly
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prompt, // Send text instead of image
          maxTokens: 300
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary.');
      }

      const data = await response.json();
      
      // Handle proxy errors
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Handle Gemini-specific errors
      if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Blocked: ${data.promptFeedback.blockReason}`);
      }
      
      const generatedSummary = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedSummary) {
        setSummary(generatedSummary);
      } else {
        throw new Error("Could not extract summary from API response.");
      }
    } catch (err: any) {
      console.error(err);
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
                  {error && <p className="text-destructive">{error}</p>}
                  {summary && <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>}
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
              <p className="text-muted-foreground">No notes found for this day.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;