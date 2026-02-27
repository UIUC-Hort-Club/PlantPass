<img src="/src/PlantPassApp/public/plantpass_logo_transp.png" alt="PlantPass Banner" />

# PlantPass

A comprehensive point-of-sale application for plant sales with real-time inventory management, transaction tracking, and sales analytics.

## Features

- 🛒 Order entry and management
- 📊 Sales analytics and reporting
- 💳 Multiple payment methods
- 🎫 Discount and voucher support
- 📧 Email receipt collection
- 🔒 Role-based access control (Admin/Staff)
- 🔄 Real-time updates via WebSocket
- 📱 Responsive design

## Architecture

- **Frontend**: React + TypeScript + Vite + Material-UI
- **Backend**: Python AWS Lambda functions
- **API**: AWS API Gateway
- **Database**: DynamoDB
- **Infrastructure**: Terraform
- **CI/CD**: GitHub Actions

## Testing

PlantPass has a comprehensive testing suite with 100% code coverage requirements.

### Quick Start

```bash
# Frontend tests
cd src/PlantPassApp
npm install
npm test

# Backend tests
cd src/lambda
pip install -r requirements-test.txt
pytest
```

### Coverage Reports

- Frontend: `src/PlantPassApp/coverage/index.html`
- Backend: `src/lambda/htmlcov/index.html`

For detailed testing documentation, see [TESTING.md](./TESTING.md).

## Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- AWS CLI configured
- Terraform 1.6+

### Local Development

```bash
# Frontend
cd src/PlantPassApp
npm install
npm run dev

# Backend (requires AWS credentials)
cd src/lambda
pip install -r requirements-test.txt
# Run tests to validate changes
pytest
```

### Running Tests

```bash
# Run all tests
npm test --workspace=src/PlantPassApp
cd src/lambda && pytest

# Watch mode (frontend only)
cd src/PlantPassApp && npm run test:watch

# With UI (frontend only)
cd src/PlantPassApp && npm run test:ui
```

## Deployment

Deployment is automated via GitHub Actions. All tests must pass before deployment.

```
Push to master → Tests → Build → Deploy
```

See [.github/workflows/deploy-app.yaml](.github/workflows/deploy-app.yaml) for details.

## Project Structure

```
PlantPass/
├── src/
│   ├── PlantPassApp/          # React frontend
│   │   ├── src/
│   │   │   ├── api/           # API client
│   │   │   ├── components/    # React components
│   │   │   ├── contexts/      # React contexts
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── types/         # TypeScript types
│   │   │   └── utils/         # Utilities
│   │   └── tests/             # Frontend tests
│   └── lambda/                # Python Lambda functions
│       ├── TransactionHandler/
│       ├── ProductsHandler/
│       ├── DiscountsHandler/
│       ├── shared/            # Shared utilities
│       ├── layers/            # Lambda layers
│       └── tests/             # Backend tests
├── terraform/                 # Infrastructure as code
├── .github/workflows/         # CI/CD pipelines
├── TESTING.md                 # Testing documentation
└── README.md                  # This file
```

## Contributing

1. Create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass: `npm test && pytest`
4. Ensure coverage remains at 100%
5. Submit a pull request

All PRs must pass CI checks before merging.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.

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