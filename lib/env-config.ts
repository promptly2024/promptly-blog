/**
 * Environment configuration utility
 * Handles missing environment variables gracefully for development
 */

export const envConfig = {
  // Clerk authentication
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_demo',
    secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_demo',
    isConfigured: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
  },
  
  // AI Services
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    isConfigured: !!process.env.GEMINI_API_KEY
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/postgres',
    isConfigured: !!process.env.DATABASE_URL
  },
  
  // Development mode check
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Allow bypass for demo/development (checks for a bypass flag)
  bypassSetup: function() {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('bypass-setup') === 'true';
    }
    return process.env.BYPASS_SETUP === 'true' || process.env.NODE_ENV === 'production';
  },
  
  // Check if all required services are configured
  isFullyConfigured: function() {
    return this.clerk.isConfigured && this.ai.isConfigured && this.database.isConfigured;
  },
  
  // Check if setup should be shown
  shouldShowSetup: function() {
    return !this.isFullyConfigured() && this.isDevelopment && !this.bypassSetup();
  }
};

export const getMissingEnvVars = (): string[] => {
  const missing = [];
  
  if (!envConfig.clerk.isConfigured) {
    missing.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY');
  }
  
  if (!envConfig.ai.isConfigured) {
    missing.push('GEMINI_API_KEY'); 
  }
  
  if (!envConfig.database.isConfigured) {
    missing.push('DATABASE_URL');
  }
  
  return missing;
};