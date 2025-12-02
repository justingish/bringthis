# Signup Coordinator

A web application that enables users to create and manage collaborative signup sheets for events without requiring authentication.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL + REST API)
- **Testing**: Vitest + fast-check (property-based testing)
- **Hosting**: Netlify

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (routes)
├── utils/          # Utility functions and helpers
├── types/          # TypeScript type definitions
└── test/           # Test setup and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Add your Supabase credentials to `.env`:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Set up the database schema:
   - Follow the instructions in `supabase/README.md` to create the database tables
   - The easiest method is to copy the SQL from `supabase/migrations/001_initial_schema.sql` and run it in the Supabase SQL Editor

### Development

Start the development server:

```bash
npm run dev
```

### Testing

Run tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Building

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## License

MIT
