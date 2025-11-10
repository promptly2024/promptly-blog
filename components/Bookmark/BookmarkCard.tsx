'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon, CalendarIcon, Trash2, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookmarkedPost {
  bookmarkId: string;
  bookmarkedAt: Date;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    status: string;
    publishedAt: Date | null;
    readingTimeMins: number | null;
    coverImageUrl: string | null;
  };
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface BookmarkCardProps {
  bookmark: BookmarkedPost;
  onRemove: (postId: string, postTitle: string) => void;
  isRemoving: boolean;
}

export function BookmarkCard({ bookmark, onRemove, isRemoving }: BookmarkCardProps) {
  const { post, author, bookmarkedAt } = bookmark;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/blog/${post.slug}`} className="group">
              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </CardTitle>
            </Link>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                disabled={isRemoving}
                className="flex-shrink-0"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove "{post.title}" from your bookmarks?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(post.id, post.title)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.coverImageUrl && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2 border-t">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatarUrl || undefined} />
            <AvatarFallback className="text-xs">
              {author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{author.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.readingTimeMins && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {post.readingTimeMins} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDate(bookmarkedAt)}
              </span>
            </div>
          </div>
        </div>

        <Button asChild className="w-full" variant="outline">
          <Link href={`/blog/${post.slug}`}>
            Read Article
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const bookmarked = new Date(date);
  const diffMs = now.getTime() - bookmarked.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;

  return bookmarked.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
