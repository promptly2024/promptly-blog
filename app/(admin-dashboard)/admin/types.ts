interface Counts {
    users: number;
    posts: number;
    comments: number;
    contactQueries: number;
    invites: number;
    categories: number;
    tags: number;
}
interface Workflow {
    postsUnderReview: {
        id: string;
        title: string;
        submittedAt: Date | null;
        authorName: string | null;
        coverImageUrl: string | null;
        authorProfileImage: string | null;
        authorEmail: string | null;
    }[];
    scheduledPosts: {
        id: string;
        title: string;
        scheduledAt: Date | null;
        authorName: string | null;
        coverImageUrl: string | null;
        authorProfileImage: string | null;
        authorEmail: string | null;
    }[];
    flaggedComments: {
        id: string;
        content: string;
        userId: string;
        createdAt: Date;
        name: string | null;
        email: string | null;
        avatarUrl: string | null;
    }[];
    pendingInvites: {
        id: string;
        inviteeEmail: string;
        role: "contributor" | "reviewer" | "co_author";
        createdAt: Date;
        inviterName: string | null;
        inviterEmail: string | null;
        inviterProfileImage: string | null;
    }[];
    pendingQueries: {
        id: string;
        name: string;
        email: string;
        subject: string | null;
        createdAt: Date;
    }[];
}
interface Recent {
    approvals: {
        postId: string;
        decision: "draft" | "under_review" | "approved" | "scheduled" | "rejected" | "archived";
        reason: string | null;
        decidedAt: Date;
        decidedBy: string;
        title: string | null;
        authorName: string | null;
        authorEmail: string | null;
        authorProfileImage: string | null;
        coverImageUrl: string | null;
        approvedByName: string | null;
        approvedByEmail: string | null;
        approvedByProfileImage: string | null;
    }[];
    auditLogs: {
        id: string;
        actorUserId: string | null;
        targetType: "user" | "other" | "post" | "comment" | "media" | "invitation" | "approval" | "system" | "email";
        targetId: string;
        action: "create" | "update" | "delete" | "delete_attempt" | "submit" | "approve" | "reject" | "publish" | "archive" | "invite" | "invite_accept" | "invite_decline" | "invite_revoke" | "login" | "logout" | "other";
        createdAt: Date;
        metadata: { [key: string]: any };
    }[];
    users: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
        siteRole: "user" | "admin";
        createdAt: Date;
    }[];
}
interface Trends {
    topTags: {
        id: string;
        name: string;
        count: number;
    }[];
    topCategories: {
        id: string;
        name: string;
        count: number;
    }[];
    postReactions: {
        type: "like" | "love" | "clap" | "insightful" | "laugh" | "sad" | "angry";
        count: number;
    }[];
    commentReactions: {
        type: "like" | "love" | "clap" | "insightful" | "laugh" | "sad" | "angry";
        count: number;
    }[];
}
export interface AdminOverviewResponse {
    counts: Counts;
    workflow: Workflow;
    recent: Recent;
    trends: Trends;
}