
import React from 'react';
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";
import { Camera, Zap, BrainCircuit } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage = ({ onLogin }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 p-8 flex flex-col items-center">
            <AnimatedLogo />
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
              Visual Notes AI
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.5s', textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
              Capture your world, transform it into smart notes. Your visual memory, reimagined.
            </p>
            <Button onClick={onLogin} size="lg" className="animate-fade-in" style={{ animationDelay: '1s' }}>
              <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 282.6 92 256 92c-71.7 0-129.9 58.2-129.9 130s58.2 130 129.9 130c79.4 0 114.2-62.8 118.9-97.4H256v-78.4h231.9c4.7 26.5 7.1 54.4 7.1 82.8z"></path></svg>
              Sign in with Google to Start
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center p-6 rounded-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="p-4 bg-primary/20 rounded-full mb-4">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">1. Snap a Photo</h3>
                <p className="text-muted-foreground">Capture anything that sparks your interest—a whiteboard, a book page, or a scenic view.</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-lg animate-fade-in" style={{animationDelay: '0.4s'}}>
                <div className="p-4 bg-primary/20 rounded-full mb-4">
                  <BrainCircuit className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">2. AI Analysis</h3>
                <p className="text-muted-foreground">Our AI instantly analyzes the image, extracting key information and generating a concise, text-based note.</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-lg animate-fade-in" style={{animationDelay: '0.6s'}}>
                <div className="p-4 bg-primary/20 rounded-full mb-4">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">3. Instant Note</h3>
                <p className="text-muted-foreground">Your visual capture is now a smart, searchable note, saved securely and accessible anytime.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
