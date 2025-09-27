"use client";

import React, { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { envConfig } from '@/lib/env-config';
import SetupGuide from './SetupGuide';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if setup should be shown (client-side only)
    const shouldShow = !envConfig.isFullyConfigured() && 
                      envConfig.isDevelopment && 
                      !envConfig.bypassSetup();
    setShowSetup(shouldShow);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    // Show loading state while checking environment
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return <SetupGuide />;
  }

  // If Clerk is not properly configured, show a minimal version without authentication
  if (!envConfig.clerk.isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Promptly Blog</h1>
          <p className="text-slate-600 mb-6">
            Welcome to Promptly Blog! This is a demo mode running without full authentication setup.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Demo Mode:</strong> To access all features including user authentication, 
              please configure your environment variables following the setup guide.
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('bypass-setup');
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Setup Guide
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={envConfig.clerk.publishableKey}>
      {children}
    </ClerkProvider>
  );
}