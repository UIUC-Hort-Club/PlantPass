<img src="/src/PlantPassApp/public/plantpass_logo_transp.png" alt="PlantPass Banner" />

# PlantPass

PlantPass is a point-of-sale application developed for the UIUC Horticulture Club to streamline checkout processes at their Spring Plant Fair. The system provides order entry, transaction management, sales analytics, and access control capabilities.

## Architecture

- Frontend: React + TypeScript application deployed on AWS CloudFront
- Backend: AWS Lambda functions with DynamoDB database
- Infrastructure: Terraform-managed AWS resources
- Real-time updates: WebSocket connections for live transaction updates
- Build tooling: Vite for fast development and optimized production builds

## Technology Stack

**Frontend:**
- React 19 with TypeScript
- Material-UI (MUI) for component library
- React Router for navigation
- Chart.js for analytics visualization
- Vite for build tooling
- ESLint + Prettier for code quality

**Backend:**
- AWS Lambda (serverless functions)
- Amazon DynamoDB (NoSQL database)
- Amazon API Gateway (REST + WebSocket APIs)
- Amazon CloudFront (CDN)
- Amazon SES (email delivery)

**Infrastructure:**
- Terraform for infrastructure as code
- GitHub Actions for CI/CD

## Features

- Home screen with role selection (Staff vs Customer)
- Passphrase-protected staff access (configurable)
- Order entry with product selection and discount application
- Transaction lookup and modification with recent unpaid orders display
- Customer-facing order lookup with read-only receipt view
- Payment processing with configurable payment methods
- Admin console with sales analytics and data export
- Product, discount, and payment method management with drag-and-drop reordering
- Resource locking to prevent concurrent edits
- Feature toggles for runtime configuration
- Real-time sales tracking and reporting
- Password visibility toggles for improved UX

## Application Routes

The application has four main routes:

1. **Home Screen** (`/`)
   - Landing page with role selection
   - "Spring Plant Fair Staff" → navigates to `/plantpass`
   - "Customer" → navigates to `/orders`
   - Settings icon (top-right) → navigates to `/admin-console`
   - Click logo to return home from any page

2. **PlantPass Staff Interface** (`/plantpass`)
   - Passphrase protection (when enabled via feature toggle)
   - Full checkout station functionality
   - Order entry and completion
   - Transaction management
   - Admin icon navigates to `/admin-console`

3. **Customer Order Lookup** (`/orders`)
   - Simple order lookup interface
   - Supports direct URL access with order ID: `/orders?id=ABC-DEF`
   - Read-only receipt display

4. **Admin Console** (`/admin-console`)
   - Password protection (when enabled via feature toggle)
   - Accessible from home screen or PlantPass interface
   - Sales analytics and data export
   - Product, discount, and payment method management
   - Feature toggles and access control
   - Password reset functionality

## Feature Toggles

Runtime configuration available in Admin Console:

- **Collect Email Addresses**: Toggle email collection during checkout
- **Password Protect Admin Console**: Require password for admin access
- **Protect PlantPass Access**: Require passphrase to access staff interface

Feature toggles sync across browser tabs and refresh when returning to the application.

## Local Development

Navigate to `./src/PlantPassApp` and run:

```bash
npm install
npm run dev
```

The development server will start at `http://localhost:5173` and automatically connect to the backend API.

### Build for Production

```bash
npm run build
```

This compiles TypeScript and builds optimized production assets in the `dist/` directory.

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality and TypeScript types.

## Infrastructure

Infrastructure is managed via Terraform in the `./terraform` directory. Deployment occurs automatically on push or pull request to the master branch.

## Project Structure

```
src/
├── PlantPassApp/          # React + TypeScript frontend application
│   ├── src/
│   │   ├── api/           # API integration layer (TypeScript)
│   │   ├── components/    # React components (TSX)
│   │   │   ├── Home/      # Home screen with role selection
│   │   │   ├── PlantPass/ # Staff checkout interface
│   │   │   ├── CustomerOrderLookup/ # Customer order lookup
│   │   │   ├── AdminConsole/ # Admin management interface
│   │   │   ├── core/      # Core order components
│   │   │   ├── Navigation/ # Navigation components
│   │   │   └── common/    # Shared components
│   │   ├── contexts/      # React contexts (notifications, feature toggles)
│   │   ├── hooks/         # Custom React hooks (WebSocket, data fetching)
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions (TypeScript)
│   └── public/            # Static assets
└── lambda/                # AWS Lambda functions
    ├── AdminPassword/     # Admin authentication & password reset
    ├── DiscountsHandler/  # Discount management
    ├── ProductsHandler/   # Product management
    ├── PaymentMethodsHandler/ # Payment method management
    ├── PlantPassAccessHandler/ # Staff access control
    ├── FeatureTogglesHandler/ # Feature toggle management
    ├── LockHandler/       # Resource locking
    ├── TransactionHandler/# Transaction processing
    ├── EmailHandler/      # Password reset emails
    └── WebSocketHandler/  # Real-time updates
terraform/                 # Infrastructure as code
```

## Contact

Primary Contact: Joseph (Joe) Ku  
Email: josephku825@gmail.com