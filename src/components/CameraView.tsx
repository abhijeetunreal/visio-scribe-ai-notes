
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, VideoOff, Loader2, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppsScriptSetup from './AppsScriptSetup';

interface CameraViewProps {
  queueNoteForProcessing: (imageDataUrl: string) => void;
}

const CameraView = ({ queueNoteForProcessing }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    // This effect ensures the camera is turned off if the user navigates away or stream changes.
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    setIsInitializing(true);
    setIsVideoReady(false);
    try {
      console.log('Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      console.log('Camera stream acquired');
      setStream(mediaStream);
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
      setIsVideoReady(false);
    }
  };

  const handleVideoCanPlay = () => {
    console.log('Video ready to play');
    setIsVideoReady(true);
  };

  const handleQuickCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      console.log('Cannot capture: video not ready');
      return;
    }
    
    setError(null);
    console.log('Capturing image...');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64ImageData = imageDataUrl.split(',')[1];
    
    console.log('Image captured, size:', base64ImageData.length);
    
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
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <VideoOff className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Camera Error</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <div className="flex gap-2">
          <Button onClick={startCamera}>Try Again</Button>
          <Dialog open={showSetup} onOpenChange={setShowSetup}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Setup Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Setup Instructions</DialogTitle>
              </DialogHeader>
              <AppsScriptSetup />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="w-full max-w-4xl aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative shadow-inner">
            <VideoOff className="h-16 w-16 text-muted-foreground mb-4"/>
            <p className="text-muted-foreground">Camera is off</p>
        </div>
        <Dialog open={showSetup} onOpenChange={setShowSetup}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Setup Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Setup Instructions</DialogTitle>
            </DialogHeader>
            <AppsScriptSetup />
          </DialogContent>
        </Dialog>
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
          onCanPlay={handleVideoCanPlay}
        />
        <canvas ref={canvasRef} className="hidden" />
        {stream && !isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="mt-8 flex gap-4">
        <Button 
          onClick={handleQuickCapture} 
          size="lg" 
          className="rounded-full w-20 h-20 shadow-lg shadow-primary/30"
          disabled={!isVideoReady}
        >
          {isVideoReady ? <Camera className="h-8 w-8" /> : <Loader2 className="h-8 w-8 animate-spin" />}
        </Button>
        <Dialog open={showSetup} onOpenChange={setShowSetup}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              <Settings className="h-5 w-5 mr-2" />
              Setup Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Google Apps Script Setup</DialogTitle>
            </DialogHeader>
            <AppsScriptSetup />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CameraView;
