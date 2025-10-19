# FleetPro - Fleet Management System

## Recent Changes - October 19, 2025

- **Fixed refueling form alignment and responsiveness**: Completely reorganized the RefuelingForm component with a responsive grid system (grid-cols-1 sm:grid-cols-2) that properly aligns all fields in both desktop and mobile views. All fields are now consistently positioned within a single responsive grid structure, eliminating the previous alignment issues between Data (Date) and Horímetro (Usage Hours) fields for refrigeration equipment.

## Overview

FleetPro is a comprehensive fleet management system designed for transportation companies, with special focus on refrigerated transport. The system provides multi-tenant capabilities (headquarters/branches), complete vehicle lifecycle management, driver tracking, fuel consumption monitoring, refrigeration equipment control, and supplier management.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, currently using in-memory storage with plans for database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as build tool and dev server
- Wouter for client-side routing
- TanStack Query for data fetching and state management
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling

**Component Organization:**
- Page components in `client/src/pages/` for main application views
- Reusable UI components in `client/src/components/ui/` (Shadcn components)
- Form components in `client/src/components/forms/` for complex data entry
- Layout component provides sidebar navigation and authentication wrapper

**State Management:**
- Authentication state managed via React Context (`useAuth` hook)
- Business data managed through custom `useMockData` hook with in-memory state
- Permissions handled via `usePermissions` hook based on user roles

**Key Design Patterns:**
- Custom hooks for business logic encapsulation (authentication, permissions, data management)
- Form validation using Zod schemas with React Hook Form
- Infinite scroll implementation for large data lists
- Protected routes with role-based access control

### Backend Architecture

**Technology Stack:**
- Express.js server
- TypeScript for type safety
- In-memory storage implementation (MemStorage class)
- Vite middleware for development hot reloading

**API Structure:**
- RESTful endpoints under `/api` prefix
- Resource-based routing (users, vehicles, drivers, refuelings, etc.)
- Authentication via simple credential checking
- CRUD operations for all major entities

**Storage Layer:**
- Abstract `IStorage` interface defines data operations
- `MemStorage` class provides in-memory implementation
- Designed for easy migration to database (Drizzle ORM prepared but not active)

**Rationale:** The in-memory storage allows rapid development and testing without database setup complexity. The interface abstraction enables seamless future migration to persistent storage.

### Authentication & Authorization

**Authentication Mechanism:**
- Simple username/password authentication
- Session persistence via localStorage
- Mock users for demonstration purposes

**Authorization Model:**
- Role-based access control (admin, manager, operator)
- Granular permissions per module and action
- Company-based data filtering (multi-tenant support)
- Custom permission overrides for non-admin users

**Roles:**
- **Admin:** Full system access including user management
- **Manager:** Access to operational modules (vehicles, fuel, refrigeration, suppliers)
- **Operator:** Limited access primarily to fuel tracking

### Data Model

**Core Entities:**
- **Users:** System users with role-based permissions and company affiliations
- **Companies:** Headquarters (matriz) and branches (filiais) in a hierarchical structure
- **Vehicles:** Complete vehicle information including composition (truck + trailers), maintenance tracking, and sale records
- **Drivers:** Driver profiles with CNH validation and company assignments
- **Refuelings:** Fuel consumption tracking for both vehicles and refrigeration units
- **Refrigeration Units:** Refrigeration equipment with temperature control and fuel tracking
- **Suppliers:** Service providers categorized by type (gas stations, workshops, dealers, etc.)

**Key Relationships:**
- Vehicles can be composed of multiple units (tractor + trailers)
- Drivers are assigned to specific vehicles
- Refuelings link to vehicles/refrigeration, drivers, and suppliers
- Companies have hierarchical relationships (matriz/filial)
- Users have primary company affiliation plus multi-company access

### Form Handling & Validation

**Validation Strategy:**
- Zod schemas define all validation rules
- React Hook Form manages form state and validation
- Custom formatters handle Brazilian currency, dates, and document formats
- Client-side validation before API submission

**File Upload Handling:**
- Base64 encoding for document storage (receipts, invoices, photos)
- Preview functionality for uploaded images
- Multiple document types per entity (CNH, vehicle photos, purchase invoices)

### UI/UX Patterns

**Component Library:**
- Shadcn/ui provides accessible, customizable base components
- Consistent design system using CSS variables for theming
- Responsive design with mobile-first approach

**Data Display:**
- Card-based layouts for entity lists
- Infinite scroll for performance with large datasets
- Advanced filtering and search capabilities
- Excel export functionality for reporting

**User Feedback:**
- Toast notifications for action confirmations
- Alert dialogs for destructive operations
- Loading states during async operations
- Form validation messages inline with fields

## External Dependencies

### Third-Party Libraries

**UI & Styling:**
- `@radix-ui/*` - Accessible, unstyled component primitives
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Icon library
- `class-variance-authority` - Component variant management
- `embla-carousel-react` - Carousel functionality

**Data & Forms:**
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation integration
- `zod` - Schema validation
- `drizzle-zod` - Drizzle schema to Zod conversion

**Utilities:**
- `date-fns` - Date manipulation and formatting
- `xlsx` - Excel file generation for exports
- `cmdk` - Command menu implementation

**Development:**
- `vite` - Build tool and dev server
- `typescript-eslint` - TypeScript linting
- `tsx` - TypeScript execution for server

### Planned Integrations

**Database (Prepared but not active):**
- `drizzle-orm` - Type-safe ORM
- PostgreSQL schemas defined in `shared/schema.ts`
- Ready for migration from in-memory to persistent storage

**Note:** The application includes Drizzle ORM configuration and schema definitions, indicating preparation for PostgreSQL integration. However, the current implementation uses in-memory storage exclusively.

### Development Tools

- ESLint for code quality
- TypeScript for type safety across frontend and backend
- Vite for fast development experience with HMR
- Path aliases configured for clean imports (`@/`, `@shared/`)