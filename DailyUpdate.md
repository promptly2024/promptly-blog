Update 17-18 Sep 2025 Rohit Kumar Yadav

1. Implemented PUT API for updating blog posts with authorization and validation.
2. Enhanced BlogPage to fetch post data and categories concurrently for better performance.
3. Created a unified BlogEditor component for both creating and editing posts, with pre-filled data in edit mode.
4. Added AI-powered title generation in BlogEditor (frontend only).
5. Improved error handling, validation, and integrated category selection and thumbnail upload in BlogEditor.
6. Developed a Markdown editor with live preview, including EditorHeader, EditorFooter, and loading skeleton components.
7. Introduced reusable Skeleton UI and EditorLoadingSkeleton for improved user experience.
8. Refactored codebase with modular utility helpers for validation, user/post ID extraction, and data fetching.
9. Implemented advanced blog filtering, pagination, and editing features with BlogsFilters and BlogsPagination components.
10. Expanded dashboard structure with new pages (Analytics, Manage Blogs, Bookmarks, Help, Media, Notifications, Settings) and added a 404 error page.

18 Sep 2025 Rohit Kumar Yadav
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