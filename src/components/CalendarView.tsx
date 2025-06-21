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
  const [debugInfo, setDebugInfo] = useState<string>('');

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
    setDebugInfo('');

    const notesText = notesForDay.map((note) => `- ${note.text}`).join('\n');
    const prompt = `Based on the following notes, provide a concise and insightful summary of the day's events and observations.\n\nNotes:\n${notesText}`;

    try {
      // Create debug info
      const debugPayload = {
        text: prompt.substring(0, 100) + '...', // Show first 100 chars
        maxTokens: 300
      };
      
      setDebugInfo(`Sending to proxy: ${proxyUrl}\nPayload: ${JSON.stringify(debugPayload, null, 2)}`);
      
      // Use proxy URL directly
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          maxTokens: 300
        }),
      });

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage += `\nDetails: ${JSON.stringify(errorData)}`;
        } catch (e) {
          errorMessage += '\n(Could not parse error details)';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Update debug info with response
      setDebugInfo(prev => prev + `\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      
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
      
      // Update debug info with error
      setDebugInfo(prev => prev + `\n\nError: ${err.message}`);
      
      setError(err.message || "Failed to generate summary");
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
            <CardDescription className="text-xs">
              Proxy URL: {proxyUrl}
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
                    <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                      <p className="text-red-700 font-medium">Error Generating Summary</p>
                      <p className="text-red-600 text-sm mt-2 whitespace-pre-wrap">{error}</p>
                      
                      <div className="mt-4">
                        <h4 className="text-red-800 font-medium text-sm">Debug Info:</h4>
                        <pre className="text-xs text-red-700 bg-red-100 p-2 rounded mt-1 overflow-auto max-h-40">
                          {debugInfo}
                        </pre>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                        onClick={() => generateSummary(dailyNotes)}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                  
                  {summary && !error && (
                    <p className="bg-green-50 border border-green-200 p-4 rounded-md whitespace-pre-wrap">
                      {summary}
                    </p>
                  )}
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