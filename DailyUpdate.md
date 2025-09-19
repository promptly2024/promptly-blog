> Update 17 Sep 2025 Rohit Kumar Yadav

1. Implemented PUT API method for updating blog posts with authorization and validation.
2. Enhanced BlogPage to fetch post data and categories concurrently.
3. Created a common BlogEditor component for both create and edit; in edit mode, data is pre-fetched and passed to the component.
4. Added AI-based title generation in BlogEditor (frontend only).
5. Improved error handling, validation, and integrated category selection + thumbnail upload in BlogEditor.
6. Developed Markdown editor with live preview, EditorHeader, EditorFooter, and loading skeleton components.
7. Introduced reusable Skeleton UI and EditorLoadingSkeleton for better UX.
8. Refactored code by creating modular utils helpers like isValidUUID/slug, getUserIdFromClerk, getPostIdFromSlug/Id.
9. Built common helper functions to fetch post data for /blog/[id] and /edit/[id] routes.
10. Updated BlogsPage props destructuring and enhanced middleware route protection.

> 18 Sep 2025 Rohit Kumar Yadav
feat: implement PUT method for updating blog posts with authorization and validation
feat: enhance BlogPage to fetch post data and categories concurrently
feat: create EditBlog page with BlogEditor component for editing posts
feat: add AI title generation feature in BlogEditor (only frontend)
feat: improve error handling and validation in BlogEditor
feat: add category selection and thumbnail upload in BlogEditor
feat: implement fetch utilities for posts and categories
feat: add Markdown content editor with live preview and loading skeleton

Implemented EditorSection component for Markdown editing with live preview using MDEditor.

Added EditorHeader and EditorFooter components for better UI structure and content statistics display.

Introduced EditorLoadingSkeleton for loading state representation.

Created Skeleton component for reusable loading skeleton UI.

feat: update BlogsPage to destructure props and await searchParams, enhance middleware with route protection

feat: Implement blog filtering, pagination, and editing features

- Added BlogsFilters component for advanced filtering options including status, visibility, author, sorting, and search.
- Created BlogsPagination component to handle pagination logic and UI.
- Developed main BlogsPage to integrate filters, content display, and pagination.
- Implemented blog editing functionality in EditBlog component with data fetching for categories and post details.
- Established a layout for the non-dashboard section with a Navbar and Footer.
- Added a WriteBlog component for creating new blog posts.
- Enhanced DashboardLayout with responsive sidebar and top navigation.

feat: Implement dashboard structure with new pages for Analytics, Manage Blogs, Bookmarks, Help, Media Management, Notifications, and Settings; add 404 error page

19 Sep 2025 Rohit Kumar Yadav

feat: add Radix UI Checkbox component and integrate into blog management UI

- Added @radix-ui/react-checkbox dependency to package.json
- Implemented Checkbox component using Radix UI in components/ui/checkbox.tsx
- Created Helper.tsx for enhanced blog management features including analytics, bulk actions, and status badges
- Integrated Checkbox component into EnhancedBlogCard for selection functionality
- Updated pnpm-lock.yaml to include new dependencies

