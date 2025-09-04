// utils/date-formatter.ts

export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(dateObj);
}

export const serializeDocument = (doc: any) => {
    const serialized = JSON.parse(JSON.stringify(doc));

    // Format dates
    if (serialized.createdAt) {
        serialized.createdAt = formatDate(serialized.createdAt);
    }
    if (serialized.updatedAt) {
        serialized.updatedAt = formatDate(serialized.updatedAt);
    }
    return serialized;
};