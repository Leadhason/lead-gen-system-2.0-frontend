# Overview

LeadGen Pro 2.0 is a comprehensive lead generation and business intelligence platform that transforms traditional command-line scraping functionality into a sophisticated web-based dashboard. The application provides real-time lead generation, data management, analytics, and file handling capabilities through an intuitive executive interface designed for business users.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern single-page application using React 18 with TypeScript for type safety
- **Component Library**: Radix UI components with shadcn/ui styling system for consistent, accessible interface
- **Styling**: Tailwind CSS with custom design tokens supporting light/dark themes
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation
- **Real-time Updates**: WebSocket integration for live progress tracking and notifications

## Backend Architecture
- **Express.js Server**: Node.js backend with TypeScript support
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit-based OAuth integration with session management
- **File Upload**: Multer middleware for handling file uploads
- **WebSocket Server**: Real-time communication for live updates during scraping operations
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

## Database Design
- **PostgreSQL**: Primary database using Neon serverless hosting
- **Schema Structure**:
  - Users table for authentication data
  - Campaigns table for lead generation projects
  - Leads table for scraped business data
  - Files table for upload management
  - Sessions table for authentication state
- **Data Relationships**: User-owned campaigns containing multiple leads with metadata tracking

## Authentication & Authorization
- **Replit OAuth**: Integrated authentication using Replit's OpenID Connect
- **Session Management**: Secure session handling with PostgreSQL storage
- **Route Protection**: Middleware-based authentication checks for API endpoints
- **User Context**: Authentication state managed through React Query

## UI/UX Design Patterns
- **Dashboard Layout**: Responsive sidebar navigation with collapsible mobile support
- **Theme System**: Dynamic light/dark mode with CSS custom properties
- **Real-time Feedback**: Progress indicators and live data updates during operations
- **Data Visualization**: Interactive tables with filtering, sorting, and export capabilities
- **Form Validation**: Client and server-side validation with user-friendly error messages

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Drizzle Kit**: Database migration and schema management tools

## Authentication
- **Replit OAuth**: OpenID Connect integration for user authentication
- **OpenID Client**: OAuth 2.0/OpenID Connect client library

## UI Components
- **Radix UI**: Headless UI component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced development experience
- **ESBuild**: Fast bundling for production builds

## Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time updates
- **TanStack React Query**: Data fetching and synchronization

## File Handling
- **Multer**: Express middleware for handling multipart/form-data uploads
- **File System APIs**: Node.js native file operations

## Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Hot Module Replacement**: Live reloading during development