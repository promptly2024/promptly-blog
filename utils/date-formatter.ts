// utils/date-formatter.ts

import React from 'react';

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

export const formatDateInPast = (date: Date | string) => {
    const now = new Date();
    const pastDate = new Date(date);
    const diffInMs = now.getTime() - pastDate.getTime();

    if (diffInMs < 60 * 1000) {
        return "just now";
    }
    if (diffInMs < 60 * 60 * 1000) {
        const diffInMin = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMin} ${diffInMin === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInMs < 24 * 60 * 60 * 1000) {
        const diffInHr = Math.floor(diffInMs / (1000 * 60 * 60));
        return `${diffInHr} ${diffInHr === 1 ? 'hour' : 'hours'} ago`;
    }
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
};
