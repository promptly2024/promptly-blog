"use client";

import React from 'react';
import { AlertTriangle, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { envConfig, getMissingEnvVars } from '@/lib/env-config';

export default function SetupGuide() {
  const missingVars = getMissingEnvVars();
  const [copiedVar, setCopiedVar] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, varName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVar(varName);
      setTimeout(() => setCopiedVar(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBypassSetup = () => {
    // Set a flag in sessionStorage to bypass setup for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bypass-setup', 'true');
      window.location.reload();
    }
  };

  if (envConfig.isFullyConfigured()) {
    return null; // Don't show setup guide if everything is configured
  }

  const sampleEnvContent = `# Environment Variables for Promptly Blog
# Copy this to your .env.local file

# Clerk Authentication
# Get these from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Gemini AI API Key  
# Get this from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL
# For local PostgreSQL database
DATABASE_URL=postgresql://postgres:password@localhost:5432/promptlyblog`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Setup Required</h1>
          <p className="text-slate-600">
            Welcome to Promptly Blog! Please configure your environment variables to get started.
          </p>
        </div>

        {/* Missing Variables Alert */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Missing environment variables:</strong> {missingVars.join(', ')}
          </AlertDescription>
        </Alert>

        {/* Setup Instructions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Quick Setup Guide</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Create environment file</h3>
                <p className="text-sm text-slate-600 mb-2">
                  Create a <code className="bg-slate-100 px-2 py-1 rounded text-xs">.env.local</code> file in your project root
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">Copy environment template</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Copy the template below and update the values with your actual keys
                </p>
                
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {sampleEnvContent}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => copyToClipboard(sampleEnvContent, 'template')}
                  >
                    {copiedVar === 'template' ? (
                      <><CheckCircle className="w-4 h-4 mr-1" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Get your API keys</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('https://dashboard.clerk.com/', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Get Clerk Keys
                    </Button>
                    <span className="text-sm text-slate-500">For authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Get Gemini API Key
                    </Button>
                    <span className="text-sm text-slate-500">For AI features</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-medium text-blue-600">4</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Restart the development server</h3>
                <p className="text-sm text-slate-600">
                  After creating the <code className="bg-slate-100 px-2 py-1 rounded text-xs">.env.local</code> file, restart your development server
                </p>
                <code className="block mt-2 bg-slate-100 px-3 py-2 rounded text-sm">npm run dev</code>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative: Continue without full setup */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h3 className="font-medium text-slate-900 mb-2">For Development/Testing Only</h3>
          <p className="text-sm text-slate-600 mb-3">
            You can continue with limited functionality using placeholder values, but some features won't work.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBypassSetup}
          >
            Continue with Limited Setup
          </Button>
        </div>
      </div>
    </div>
  );
}