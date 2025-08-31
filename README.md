# Admin Portal

A comprehensive admin portal for managing AI agent swarms, training data, event triggers, and system monitoring.

## Features

- **Dashboard**: Real-time overview of system health and metrics
- **Swarm Management**: Create, configure, and manage AI agent swarms
- **Training Data**: Upload and manage training datasets
- **Event Triggers**: Configure automated actions based on system events
- **Agent Decisions**: View and analyze agent decision history
- **System Logs**: Monitor system logs and metrics

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Ant Design v5
- **State Management**: Zustand
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Mock API**: Custom mock service layer

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
admin-portal/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── styles/             # Global styles
│   └── App.tsx             # Main application component
├── public/                 # Static assets
└── package.json
```

## Development

The application runs on `http://localhost:5173` in development mode.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Components

### Core UI Components
- **MainLayout**: Sidebar navigation with collapsible menu
- **DataTable**: Reusable table with sorting and filtering
- **LoadingSpinner**: Loading states and spinners
- **EmptyState**: Empty state placeholder
- **ErrorBoundary**: Error handling wrapper

### Pages
- **Dashboard**: System overview with metrics and health status
- **SwarmManagement**: CRUD operations for swarms
- **TrainingData**: Data upload and management (placeholder)
- **EventTriggers**: Trigger configuration (placeholder)
- **AgentDecisions**: Decision viewer (placeholder)
- **SystemLogs**: Log viewer (placeholder)

## API Mocking

The application uses a mock API service (`src/services/mockApi.ts`) to simulate backend operations with realistic delays and data persistence in memory.
