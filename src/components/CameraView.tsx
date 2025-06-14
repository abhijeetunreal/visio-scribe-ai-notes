
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, VideoOff, Loader2 } from 'lucide-react';

interface CameraViewProps {
  queueNoteForProcessing: (imageDataUrl: string) => void;
}

const CameraView = ({ queueNoteForProcessing }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    // This effect ensures the camera is turned off if the user navigates away or stream changes.
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    setIsInitializing(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions and try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleQuickCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    
    // This check ensures the video has loaded before we try to capture.
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Could not capture image. The video stream isn't fully ready yet. Please wait a moment and try again.");
      return;
    }
    
    setError(null);

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    const base64ImageData = imageDataUrl.split(',')[1];
    
    // Stop camera immediately after capture to free up resources
    stopCamera();
    
    if (!base64ImageData) {
        setError("Failed to capture a valid image. Please try again.");
        return;
    }
    
    queueNoteForProcessing(imageDataUrl);
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Starting camera...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <VideoOff className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Camera Error</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={startCamera} className="mt-4">Try Again</Button>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="w-full max-w-4xl aspect-video bg-muted rounded-lg overflow-hidden relative shadow-2xl shadow-primary/10">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="mt-8">
        <Button 
          onClick={handleQuickCapture} 
          size="lg" 
          className="rounded-full w-20 h-20 shadow-lg shadow-primary/30"
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
