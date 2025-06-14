
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, VideoOff, Play } from 'lucide-react';
import { Note } from '@/types';

interface CameraViewProps {
  addNote: (note: Note) => void;
  apiKey: string;
}

const CameraView = ({ addNote, apiKey }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect ensures the camera is turned off if the user navigates away.
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    const base64ImageData = imageDataUrl.split(',')[1];
    
    // Stop camera immediately after capture to free up resources
    stopCamera();

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Describe what you see in this image in a detailed but concise way, as if you were taking a note. Focus on the main subject and key details of the environment.' },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64ImageData,
                },
              },
            ],
          }],
          generationConfig: {
            "maxOutputTokens": 300
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to analyze image.');
      }

      const data = await response.json();

      if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Request blocked: ${data.promptFeedback.blockReason}. Please try a different image.`);
      }

      const description = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!description) {
        throw new Error("Failed to get a description from the image. The API response might be empty or invalid.");
      }

      const newNote: Note = {
        id: new Date().toISOString(),
        image: imageDataUrl,
        text: description,
        createdAt: new Date().toISOString(),
      };

      addNote(newNote);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <VideoOff className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Camera Error</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-full max-w-4xl aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative shadow-inner">
            <VideoOff className="h-16 w-16 text-muted-foreground mb-4"/>
            <p className="text-muted-foreground">Camera is off</p>
        </div>
        <div className="mt-8">
            <Button onClick={startCamera} size="lg" className="rounded-full w-20 h-20 shadow-lg shadow-primary/30">
                <Play className="h-8 w-8" />
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="w-full max-w-4xl aspect-video bg-muted rounded-lg overflow-hidden relative shadow-2xl shadow-primary/10">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="mt-8">
        <Button onClick={captureAndAnalyze} disabled={loading} size="lg" className="rounded-full w-20 h-20 shadow-lg shadow-primary/30">
          {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
