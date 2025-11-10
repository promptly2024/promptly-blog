import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookmarkIcon } from 'lucide-react';

export function EmptyBookmarkState() {
  return (
    <Card className="text-center py-16">
      <CardContent className="space-y-4 pt-6">
        <BookmarkIcon className="h-16 w-16 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground mb-6">
            Start saving posts you want to read later by clicking the bookmark icon.
          </p>
          <Button asChild>
            <Link href="/blogs">Browse Posts</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
