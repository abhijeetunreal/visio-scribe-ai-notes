
import React from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center text-center">
          <div className="p-8 flex flex-col items-center">
            <Camera className="w-24 h-24 text-primary mb-6" />
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              Visual Notes AI
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8">
              Capture your world, transform it into smart notes. Your visual memory, reimagined.
            </p>
            <Button size="lg" asChild>
              <a href="#">Get Started</a>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
