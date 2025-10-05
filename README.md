# Promptly Blog

A modern blogging platform built with Next.js, featuring AI-powered content creation, user authentication, and a rich text editor.

## Features

- 🚀 **Modern Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- 🤖 **AI-Powered**: Integrated with Google Gemini for content assistance
- 🔐 **Authentication**: Secure user authentication with Clerk
- ✍️ **Rich Editor**: Advanced markdown editor with live preview
- 📱 **Responsive**: Mobile-first design with modern UI components
- 🗃️ **Database**: PostgreSQL with Drizzle ORM
- 🎨 **UI Components**: Beautiful components built with Radix UI

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd promptly-blog
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```bash
# Clerk Authentication (Required)
# Get from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Gemini AI API Key (Required for AI features)
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (Required)
DATABASE_URL=postgresql://postgres:password@localhost:5432/promptlyblog
```

### 3. Database Setup

Set up your PostgreSQL database and run migrations:

```bash
# Generate database migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# View database in Drizzle Studio (optional)
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Getting API Keys

### Clerk Authentication
1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your publishable key and secret key

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:generate    # Generate migrations
npm run db:migrate     # Apply migrations
npm run db:studio      # Open Drizzle Studio
```

## Project Structure

```
promptly-blog/
├── app/                  # Next.js App Router
├── components/           # Reusable UI components
├── lib/                  # Utility libraries
├── actions/              # Server actions
├── db/                   # Database schema and migrations
├── utils/                # Helper functions
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.