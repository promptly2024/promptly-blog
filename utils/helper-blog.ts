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
