<img src="/src/PlantPassApp/public/plantpass_logo_transp.png" alt="PlantPass Banner" />

# PlantPass

PlantPass is a point-of-sale application developed for the UIUC Horticulture Club to streamline checkout processes at their Spring Plant Fair. The system provides order entry, transaction management, and sales analytics capabilities.

## Architecture

- Frontend: React application deployed on AWS CloudFront
- Backend: AWS Lambda functions with DynamoDB database
- Infrastructure: Terraform-managed AWS resources

## Features

- Home screen with role selection (Staff vs Customer)
- Order entry with product selection and discount application
- Transaction lookup and modification with recent unpaid orders display
- Customer-facing order lookup with read-only receipt view
- Payment processing with multiple payment methods
- Admin console with sales analytics and data export
- Product and discount management
- Real-time sales tracking and reporting
- Loading indicators for improved user experience

## Application Routes

The application now has three main routes:

1. **Home Screen** (`/`)
   - Landing page with role selection
   - "Spring Plant Fair Staff" → navigates to `/plantpass`
   - "Customer" → navigates to `/orders`

2. **PlantPass Staff Interface** (`/plantpass`)
   - Full checkout station functionality
   - Order entry and completion
   - Admin console access
   - Transaction management

3. **Customer Order Lookup** (`/orders`)
   - Simple order lookup interface
   - Supports direct URL access with order ID: `/orders?id=ABC-DEF`
   - Read-only receipt display

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
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── lambda/                # AWS Lambda functions
    ├── AdminPassword/     # Admin authentication
    ├── DiscountsHandler/  # Discount management
    ├── ProductsHandler/   # Product management
    └── TransactionHandler/# Transaction processing
terraform/                 # Infrastructure as code
```

## Contact

Primary Contact: Joseph (Joe) Ku  
Email: josephku825@gmail.com