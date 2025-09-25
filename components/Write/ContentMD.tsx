"use client";

import React, { useState, useMemo, Suspense, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Brain, FileText, Palette } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Import AI hooks
import { 
  useAIContinuation, 
  useOutlineGeneration, 
  useToneRewrite 
} from "@/lib/ai/hooks";
import type { OutlineItem, ToneType } from "@/lib/ai/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorSectionProps {
  contentMd: string;
  handleContentChange: (value: string) => void;
}

const EditorLoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton
        key={i}
        className={cn("w-full", i % 2 === 0 ? "h-64" : "h-8")}
      />
    ))}
  </div>
);

const EditorHeader = () => (
  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      AI-Enhanced Content Editor
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Write with AI assistance: context-aware continuation, structure analysis, and tone optimization
    </p>
  </div>
);

const EditorFooter = ({
  wordCount,
  charCount,
}: {
  wordCount: number;
  charCount: number;
}) => (
  <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
    <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
      <span className="flex items-center">
        <span className="font-medium mr-1">Words:</span> {wordCount}
      </span>
      <span className="flex items-center">
        <span className="font-medium mr-1">Characters:</span> {charCount}
      </span>
    </div>
    <div className="mt-2 sm:mt-0">
      <span className="text-xs text-gray-400">
        Last saved: {new Date().toLocaleTimeString()}
      </span>
    </div>
  </div>
);

const OutlinePreview = ({ 
  outline, 
  onApplyOutline 
}: { 
  outline: OutlineItem[]; 
  onApplyOutline: () => void;
}) => (
  <Card className="mt-4">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Suggested Structure
        </h3>
        <Button size="sm" onClick={onApplyOutline}>
          Apply Structure
        </Button>
      </div>
      <div className="space-y-2">
        {outline.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span 
              className="text-sm"
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              {"#".repeat(item.level)} {item.title}
            </span>
            <div className="flex gap-1">
              {item.needsDetail && <Badge variant="secondary" className="text-xs">Detail</Badge>}
              {item.needsSources && <Badge variant="secondary" className="text-xs">Sources</Badge>}
              {item.needsExamples && <Badge variant="secondary" className="text-xs">Examples</Badge>}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const EditorSection = ({
  contentMd,
  handleContentChange,
}: EditorSectionProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // AI Hooks
  const { generateContinuation, isLoading: isContinuing, error: continuationError } = useAIContinuation();
  const { generateOutline, outline, showOutline, hideOutline, isLoading: isAnalyzing, error: outlineError } = useOutlineGeneration();
  const { rewriteWithTone, isLoading: isRewriting, error: rewriteError } = useToneRewrite();
  
  // Combined loading state
  const isAnyLoading = isContinuing || isAnalyzing || isRewriting;
  
  // Combined error state
  const aiError = continuationError || outlineError || rewriteError;

  const contentStats = useMemo(() => {
    const words = contentMd.trim().split(/\s+/).filter((word) => word.length > 0);
    return {
      wordCount: words.length,
      charCount: contentMd.length,
    };
  }, [contentMd]);

  // AI Feature Handlers
  const handleAIContinuation = useCallback(() => {
    generateContinuation(contentMd, (continuation) => {
      handleContentChange(contentMd + continuation);
    });
  }, [contentMd, generateContinuation, handleContentChange]);

  const handleGenerateOutline = useCallback(() => {
    generateOutline(contentMd);
  }, [contentMd, generateOutline]);

  const handleApplyOutline = useCallback(() => {
    const outlineText = outline
      .map(item => `${"#".repeat(item.level)} ${item.title}\n\n`)
      .join('');
    
    handleContentChange(outlineText + '\n' + contentMd);
    hideOutline();
  }, [outline, contentMd, handleContentChange, hideOutline]);

  const handleToneRewrite = useCallback((tone: ToneType) => {
    rewriteWithTone(contentMd, tone, (rewrittenContent) => {
      handleContentChange(rewrittenContent);
    });
  }, [contentMd, rewriteWithTone, handleContentChange]);

  const AIToolbar = () => (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-b">
      <Button
        variant="outline"
        size="sm"
        onClick={handleAIContinuation}
        disabled={isAnyLoading}
        className="flex items-center gap-2"
      >
        <Brain className="h-4 w-4" />
        {isContinuing ? "Continuing..." : "AI Continue"}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateOutline}
        disabled={isAnyLoading || !contentMd.trim()}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        {isAnalyzing ? "Analyzing..." : "Structure Analysis"}
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <Select onValueChange={handleToneRewrite} disabled={isAnyLoading || !contentMd.trim()}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="concise">Concise</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isAnyLoading && (
        <div className="ml-auto">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div className={cn("rounded-lg shadow-md transition-all")}>
        <EditorHeader />
        <AIToolbar />

        <div className="p-4">
          <div className="relative min-h-[400px]">
            <Suspense fallback={<EditorLoadingSkeleton />}>
              <div className={cn("rounded-md border")}>
                <MDEditor
                  value={contentMd}
                  onChange={(val) => handleContentChange(val || "")}
                  height={400}
                  preview='live'
                  className={cn("editor-wrapper")}
                  textareaProps={{
                    placeholder: "Start writing your content... Use AI features above to enhance your writing!"
                  }}
                />
              </div>
            </Suspense>
          </div>

          {showOutline && outline.length > 0 && (
            <OutlinePreview 
              outline={outline} 
              onApplyOutline={handleApplyOutline}
            />
          )}

          <EditorFooter {...contentStats} />
        </div>
      </div>

      {aiError && (
        <Alert variant="destructive" className={cn("mt-4")}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {aiError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
