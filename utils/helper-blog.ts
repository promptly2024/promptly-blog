export const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

export const calculateWordCount = (content: string): number => {
    return content.trim().split(/\s+/).length;
};

export const generateExcerpt = (content: string, maxLength: number = 160): string => {
    // will use GEMINI to generate excerpt
    const plainText = content
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/`([^`]+)`/g, '$1') // Remove code
        .replace(/>\s/g, '') // Remove blockquotes
        .trim();

    if (plainText.length <= maxLength) {
        return plainText;
    }

    return plainText.substring(0, maxLength).replace(/\s\w+$/, '') + '...';
};

export const checkAndMakeValidSlug = (slug: string | null | undefined): string => {
    if (!slug) return '';
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const isValid = slugRegex.test(slug);
    // if not valid make it valid by replacing spaces with dashes and removing special characters
    if (!isValid) {
        const validSlug = slug
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with dashes
            .replace(/[^a-z0-9-]/g, '') // Remove special characters
            .replace(/--+/g, '-') // Replace multiple dashes with a single dash
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
        return validSlug;
    }
    return slug;
};

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function makeValidSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/[^a-z0-9-]/g, '') // Remove special characters
        .replace(/--+/g, '-') // Replace multiple dashes with a single dash
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
}