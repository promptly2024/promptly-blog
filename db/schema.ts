import {
    pgTable,
    uuid,
    text,
    varchar,
    integer,
    boolean,
    timestamp,
    jsonb,
    pgEnum,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * ---- ENUMS ----
 */

// Post lifecycle for admin review + publishing
export const postStatusEnum = pgEnum("post_status", [
    "draft",        // author/collaborators edit
    "submitted",    // submitted for admin review
    "under_review", // (optional) triage/moderation queue
    "approved",     // approved by admin (may schedule/publish next)
    "scheduled",    // approved + has scheduledAt
    "published",    // live
    "rejected",     // rejected (store reason)
    "archived",     // no longer actively shown
]);

// Visibility of a post
export const visibilityEnum = pgEnum("visibility", [
    "public", // after admin approval, visible to all and our platforms
    "unlisted", // not listed publicly, but accessible with a link no approval required, if approved move to public
    "private",  // only visible to the user and collaborators
]);

export const siteRoleEnum = pgEnum("site_role", [
    "user",
    "admin",
]);

// Collaborator role (post-scoped)
export const collaboratorRoleEnum = pgEnum("collaborator_role", [
    "contributor", // can edit/collaborate article but not will be shown as coauthor
    "reviewer",    // comment/suggest only
    "co_author",   // still NOT the main author; shown in byline if desired
]);

// Invitation status for collaborators
export const inviteStatusEnum = pgEnum("invite_status", [
    "pending",
    "accepted",
    "declined",
    "revoked",
    "expired",
]);

// Comment status for moderation
export const commentStatusEnum = pgEnum("comment_status", [
    "visible",
    "hidden", // not shown to anyone except the author and admins because it may be under review
    "flagged", // may be inappropriate or violate guidelines, under review
    "deleted", // permanently removed
]);

// Reaction types (extend as you like)
export const reactionTypeEnum = pgEnum("reaction_type", [
    "like",
    "love",
    "clap",
    "insightful",
    "laugh",
    "sad",
    "angry",
]);

export const auditActionEnum = pgEnum("audit_action", [
    "create",
    "update",
    "delete",
    "submit",
    "approve",
    "reject",
    "publish",
    "archive",
    "invite",
    "invite_accept",
    "invite_decline",
    "invite_revoke",
    "login",
    "logout",
]);

export const auditTargetEnum = pgEnum("audit_target", [
    "post",
    "comment",
    "user",
    "invitation",
    "approval",
]);

/**
 * ---- TABLES ----
 */

// USERS — mirror Clerk user with extra fields you control
export const user = pgTable(
    "user",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        clerkId: text("clerk_id").unique().notNull(), // map to Clerk user id
        email: text("email").unique().notNull(),
        name: text("name").notNull(),
        avatarUrl: text("avatar_url"),
        bio: text("bio"),
        siteRole: siteRoleEnum("site_role").default("user").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp("deleted_at", { withTimezone: true }),
    },
    (t) => ({
        idxUsersRole: index("idx_users_role").on(t.siteRole),
    })
);

// MEDIA — store assets (cover images, OG images, etc.)
export const media = pgTable(
    "media",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        url: text("url").notNull(),
        type: varchar("type", { length: 32 }).notNull(), // image|video|audio|file
        provider: varchar("provider", { length: 64 }).default("other").notNull(), // s3|cloudinary|vercel-blob|other
        width: integer("width"),
        height: integer("height"),
        sizeBytes: integer("size_bytes"),

        createdBy: uuid("created_by").references(() => user.id),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        idxMediaCreator: index("idx_media_created_by").on(t.createdBy),
    })
);

// POSTS — single author, many collaborators, full lifecycle
export const posts = pgTable(
    "posts",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        // Ownership
        authorId: uuid("author_id").notNull().references(() => user.id),

        // Content
        title: varchar("title", { length: 256 }).notNull(),
        slug: varchar("slug", { length: 256 }).notNull(),
        excerpt: text("excerpt"),
        contentMd: text("content_md").notNull(),   // markdown / MDX source

        // Metadata/SEO
        coverImageId: uuid("cover_image_id").references(() => media.id),
        ogImageUrl: text("og_image_url"),
        canonicalUrl: text("canonical_url"),
        metaTitle: varchar("meta_title", { length: 256 }),
        metaDescription: varchar("meta_description", { length: 512 }),

        // Publication
        status: postStatusEnum("status").default("draft").notNull(),
        visibility: visibilityEnum("visibility").default("public").notNull(),
        publishedAt: timestamp("published_at", { withTimezone: true }),
        scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
        submittedAt: timestamp("submitted_at", { withTimezone: true }),
        approvedAt: timestamp("approved_at", { withTimezone: true }),
        rejectedAt: timestamp("rejected_at", { withTimezone: true }),
        rejectionReason: text("rejection_reason"),

        // Analytics/quality
        wordCount: integer("word_count"),
        readingTimeMins: integer("reading_time_mins"),

        // Audit
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp("deleted_at", { withTimezone: true }),
    },
    (t) => ({
        uqPostSlug: uniqueIndex("uq_posts_slug").on(t.slug),
        idxPostsStatus: index("idx_posts_status").on(t.status),
        idxPostsAuthor: index("idx_posts_author").on(t.authorId),
        idxPostsPublishedAt: index("idx_posts_published_at").on(t.publishedAt),
    })
);

// POST COLLABORATORS — many-to-many users on a post (NOT the author)
export const postCollaborators = pgTable(
    "post_collaborators",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        postId: uuid("post_id").notNull().references(() => posts.id),
        userId: uuid("user_id").notNull().references(() => user.id),

        role: collaboratorRoleEnum("role").default("contributor").notNull(),

        // Fine-grained permissions
        canEdit: boolean("can_edit").default(true).notNull(),
        canSubmit: boolean("can_submit").default(false).notNull(), // whether they can move post to 'submitted'
        canComment: boolean("can_comment").default(true).notNull(),

        addedByUserId: uuid("added_by_user_id").references(() => user.id),

        invitedAt: timestamp("invited_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    },
    (t) => ({
        uqPostUser: uniqueIndex("uq_post_collaborators_post_user").on(
            t.postId,
            t.userId
        ),
        idxPostCollabPost: index("idx_post_collab_post").on(t.postId),
        idxPostCollabUser: index("idx_post_collab_user").on(t.userId),
    })
);

// COLLAB INVITES — email-based invitations for collaboration
export const collaborationInvites = pgTable(
    "collaboration_invites",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        postId: uuid("post_id").notNull().references(() => posts.id),
        inviterId: uuid("inviter_id").notNull().references(() => user.id),

        inviteeEmail: text("invitee_email").notNull(),
        role: collaboratorRoleEnum("role").default("contributor").notNull(),
        status: inviteStatusEnum("status").default("pending").notNull(),

        token: varchar("token", { length: 128 }).notNull(), // for magic-link/accept
        expiresAt: timestamp("expires_at", { withTimezone: true }),

        acceptedByUserId: uuid("accepted_by_user_id").references(() => user.id),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        idxInvitePost: index("idx_invites_post").on(t.postId),
        idxInviteEmail: index("idx_invites_email").on(t.inviteeEmail),
        uqInviteToken: uniqueIndex("uq_invites_token").on(t.token),
    })
);

// APPROVAL LOG — immutable history of admin decisions
export const approvalLog = pgTable(
    "approval_log",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        postId: uuid("post_id").notNull().references(() => posts.id),
        decidedByUserId: uuid("decided_by_user_id")
            .notNull()
            .references(() => user.id),
        decision: postStatusEnum("decision").notNull(), // approved | rejected (use enum to keep consistent)
        reason: text("reason"),
        decidedAt: timestamp("decided_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        idxApprovalPost: index("idx_approval_post").on(t.postId),
        idxApprovalDecidedBy: index("idx_approval_by").on(t.decidedByUserId),
    })
);

// REVISIONS — track edits over time, including content changes and metadata
export const postRevisions = pgTable(
    "post_revisions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        postId: uuid("post_id").notNull().references(() => posts.id), // The post being revised
        editedByUserId: uuid("edited_by_user_id").references(() => user.id), // User who edited the post

        title: varchar("title", { length: 256 }).notNull(), // Title of the post at the time of revision
        contentMd: text("content_md").notNull(), // Markdown content of the post at the time of revision

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        idxRevisionsPost: index("idx_revisions_post").on(t.postId),
    })
);

// CATEGORIES
export const categories = pgTable(
    "categories",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 128 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    }
);

// POST ↔ CATEGORIES (many-to-many)
export const postCategories = pgTable(
    "post_categories",
    {
        postId: uuid("post_id").notNull().references(() => posts.id),
        categoryId: uuid("category_id").notNull().references(() => categories.id),
        addedAt: timestamp("added_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        pk: uniqueIndex("uq_post_categories").on(t.postId, t.categoryId),
    })
);

// TAGS
export const tags = pgTable(
    "tags",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        slug: varchar("slug", { length: 64 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        uqTagSlug: uniqueIndex("uq_tags_slug").on(t.slug),
    })
);

// POST ↔ TAGS (many-to-many)
export const postTags = pgTable(
    "post_tags",
    {
        postId: uuid("post_id").notNull().references(() => posts.id),
        tagId: uuid("tag_id").notNull().references(() => tags.id),
        addedAt: timestamp("added_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        pk: uniqueIndex("uq_post_tags").on(t.postId, t.tagId),
    })
);

// COMMENTS
export const comments = pgTable(
    "comments",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        postId: uuid("post_id").notNull().references(() => posts.id),
        userId: uuid("user_id").notNull().references(() => user.id),

        content: text("content").notNull(),
        status: commentStatusEnum("status").default("visible").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        idxCommentsPost: index("idx_comments_post").on(t.postId),
        idxCommentsUser: index("idx_comments_user").on(t.userId),
    })
);

// POST REACTIONS (per-user unique by type)
export const postReactions = pgTable(
    "post_reactions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        postId: uuid("post_id").notNull().references(() => posts.id),
        userId: uuid("user_id").notNull().references(() => user.id),
        type: reactionTypeEnum("type").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        uqPostReaction: uniqueIndex("uq_post_reaction").on(
            t.postId,
            t.userId,
            t.type
        ),
    })
);

// COMMENT REACTIONS
export const commentReactions = pgTable(
    "comment_reactions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        commentId: uuid("comment_id").notNull().references(() => comments.id),
        userId: uuid("user_id").notNull().references(() => user.id),
        type: reactionTypeEnum("type").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        uqCommentReaction: uniqueIndex("uq_comment_reaction").on(
            t.commentId,
            t.userId,
            t.type
        ),
    })
);

// AUDIT LOG — everything important
export const auditLogs = pgTable(
    "audit_logs",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        actorUserId: uuid("actor_user_id").references(() => user.id), // User who performed the action
        targetType: auditTargetEnum("target_type").notNull(), // Type of the target (post, comment, etc.)
        targetId: uuid("target_id").notNull(), // ID of the target (post, comment, etc.)
        action: auditActionEnum("action").notNull(), // Type of action performed (create, update, delete, etc.)
        metadata: jsonb("metadata"), // Additional metadata about the action, jsonb is used for flexible schema
        createdAt: timestamp("created_at", { withTimezone: true }) // When the action was performed
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        idxAuditActor: index("idx_audit_actor").on(t.actorUserId),
        idxAuditTarget: index("idx_audit_target").on(t.targetType, t.targetId),
    })
);
