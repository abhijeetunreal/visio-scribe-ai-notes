import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { isSameDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CalendarViewProps {
  notes: Note[];
  proxyUrl: {PROXY_URL};
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
        setError(null);
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
      // Use proxy URL directly
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add this header for CORS
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          text: prompt,
          maxTokens: 300
        }),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Handle proxy errors
      if (data.error) {
        throw new Error(
          data.error.details?.error?.message || 
          data.error || 
          'Unknown proxy error'
        );
      }
      
      // Handle Gemini-specific errors
      if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      }
      
      const generatedSummary = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedSummary) {
        setSummary(generatedSummary);
      } else {
        throw new Error("No summary generated in API response");
      }
    } catch (err: any) {
      console.error("Summary error:", err);
      
      // Handle specific CORS error
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Network error. Please check: \n1. Your internet connection \n2. Proxy URL is correct \n3. Script deployment is set to "Anyone, even anonymous"');
      } 
      // Handle Google authentication error
      else if (err.message.includes('requires permission')) {
        setError('Proxy authentication error. Please ensure the script is deployed with "Anyone, even anonymous" access.');
      }
      else {
        setError(err.message || "Failed to generate summary");
      }
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
              {proxyUrl ? `Using proxy: ${new URL(proxyUrl).hostname}` : 'Proxy not configured'}
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
                      Generating summary...
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-50 p-4 rounded-md border border-red-200">
                      <p className="text-red-700 font-medium">Error</p>
                      <p className="text-red-600 text-sm mt-2 whitespace-pre-wrap">{error}</p>
                      <Button
                        variant="outline"
                        className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                        onClick={() => generateSummary(dailyNotes)}
                      >
                        Retry
                      </Button>
                      <p className="text-xs text-red-500 mt-3">
                        If this persists, check Apps Script execution logs
                      </p>
                    </div>
                  )}
                  
                  {summary && !error && (
                    <p className="bg-green-50 border border-green-200 p-4 rounded-md whitespace-pre-wrap">
                      {summary}
                    </p>
                  )}
                </div>
                
                {/* ... rest of your component ... */}
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