<img src="/src/PlantPassApp/public/plantpass_logo_transp.png" alt="PlantPass Banner" />

# PlantPass

PlantPass is a point-of-sale application developed for the UIUC Horticulture Club to streamline checkout processes at their Spring Plant Fair. The system provides order entry, transaction management, sales analytics, and access control capabilities.

## Architecture

- Frontend: React application deployed on AWS CloudFront
- Backend: AWS Lambda functions with DynamoDB database
- Infrastructure: Terraform-managed AWS resources
- Real-time updates: WebSocket connections for live transaction updates

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

The application has three main routes:

1. **Home Screen** (`/`)
   - Landing page with role selection
   - "Spring Plant Fair Staff" → navigates to `/plantpass`
   - "Customer" → navigates to `/orders`
   - Click logo to return home from any page

2. **PlantPass Staff Interface** (`/plantpass`)
   - Passphrase protection (when enabled via feature toggle)
   - Full checkout station functionality
   - Order entry and completion
   - Admin console access
   - Transaction management

3. **Customer Order Lookup** (`/orders`)
   - Simple order lookup interface
   - Supports direct URL access with order ID: `/orders?id=ABC-DEF`
   - Read-only receipt display

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

The development server will start and automatically connect to the backend API.

## Infrastructure

Infrastructure is managed via Terraform in the `./terraform` directory. Deployment occurs automatically on push or pull request to the master branch.

## Project Structure

```
src/
├── PlantPassApp/          # React frontend application
│   ├── src/
│   │   ├── api/           # API integration layer
│   │   ├── components/    # React components
│   │   │   ├── Home/      # Home screen with role selection
│   │   │   ├── PlantPass/ # Staff checkout interface
│   │   │   ├── CustomerOrderLookup/ # Customer order lookup
│   │   │   ├── AdminConsole/ # Admin management interface
│   │   │   ├── core/      # Core order components
│   │   │   ├── Navigation/ # Navigation components
│   │   │   └── common/    # Shared components
│   │   ├── contexts/      # React contexts (notifications, feature toggles)
│   │   ├── hooks/         # Custom React hooks (WebSocket, data fetching)
│   │   └── utils/         # Utility functions
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