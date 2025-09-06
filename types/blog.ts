export interface BlogType {
    id: string;
    authorId: string;
    title: string;
    slug: string;
    excerpt: string | null;
    contentMd: string | null;
    coverImageId: string | null;
    ogImageUrl: string | null;
    canonicalUrl: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    status: string;
    visibility: string;
    publishedAt: string | null;
    scheduledAt: string | null;
    submittedAt: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
    wordCount: number | null;
    readingTimeMins: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;

    coverImage?: MediaType
}
export interface MediaType {
    id: string
    url: string
    type: string   // image | video | audio | file
    provider: string // s3 | cloudinary | vercel-blob | other
    altText?: string
    createdBy?: string
    createdAt?: Date
}
