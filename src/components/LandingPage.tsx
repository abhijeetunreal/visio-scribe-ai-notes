
import React from 'react';
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage = ({ onLogin }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center text-center">
          <div className="p-8 flex flex-col items-center">
            <AnimatedLogo />
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
              Visual Notes AI
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              Capture your world, transform it into smart notes. Your visual memory, reimagined.
            </p>
            <Button onClick={onLogin} size="lg" className="animate-fade-in" style={{ animationDelay: '1s' }}>
              <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 282.6 92 256 92c-71.7 0-129.9 58.2-129.9 130s58.2 130 129.9 130c79.4 0 114.2-62.8 118.9-97.4H256v-78.4h231.9c4.7 26.5 7.1 54.4 7.1 82.8z"></path></svg>
              Sign in with Google to Start
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
