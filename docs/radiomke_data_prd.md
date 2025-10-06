# Radio Milwaukee Streaming Analytics Platform - Product Requirements Document (Next.js)

**Version:** 2.0 Next.js Edition  
**Date:** October 2025  
**Author:** Manus AI  
**Technology Stack:** Next.js, React, TypeScript, Node.js  
**Stakeholders:** Radio Milwaukee Program Directors, Station Management, Development Team

---

## Executive Summary

The Radio Milwaukee Streaming Analytics Platform is a modern web application built with Next.js that analyzes streaming metrics from Triton Webcast and correlates them with Nielsen ratings data. The platform provides program directors with intelligent insights, AI-powered analysis, and strategic recommendations for data-driven programming decisions through a responsive, high-performance web interface.

### Key Value Propositions

**Modern Web Architecture**: Built with Next.js for optimal performance, SEO, and user experience across all devices and browsers.

**Real-time Analytics Dashboard**: Interactive React components provide immediate insights with smooth animations and responsive design.

**AI-Powered Chat Interface**: Integrated OpenAI API enables natural language queries with context-aware responses and conversation memory.

**Cross-Platform Data Integration**: Seamlessly combines Triton streaming metrics with Nielsen broadcast data for comprehensive audience analysis.

**Enterprise-Ready Deployment**: Supports various deployment options including Vercel, AWS, or on-premises hosting with scalable architecture.

---

## Technical Architecture

### Technology Stack

**Frontend Framework**: Next.js 14+ with App Router for optimal performance and developer experience.

**UI Components**: React 18+ with TypeScript for type safety and modern component architecture.

**Styling**: Tailwind CSS for responsive design and consistent styling across components.

**Charts and Visualizations**: Recharts or Chart.js for interactive data visualizations with React integration.

**State Management**: React Context API and useState/useEffect hooks for local state, with optional Zustand for complex state management.

**API Integration**: Next.js API routes for backend functionality and OpenAI API integration.

**File Processing**: Papa Parse for CSV parsing and processing in the browser or server-side.

**Database**: Optional PostgreSQL or MongoDB for data persistence, with initial CSV-based implementation.

### Architecture Overview

The application follows a modern full-stack architecture with clear separation of concerns. The frontend consists of React components organized in a modular structure with reusable UI elements, data visualization components, and intelligent chat interfaces. The backend utilizes Next.js API routes to handle file uploads, data processing, AI query processing, and external API integrations.

**Component Structure:**
```
/components
  /dashboard
    - MetricsOverview.tsx
    - TrendAnalysis.tsx
    - DaypartComparison.tsx
    - DeviceAnalysis.tsx
  /charts
    - CUMETrendChart.tsx
    - TLHBarChart.tsx
    - CorrelationScatter.tsx
  /ai-chat
    - ChatInterface.tsx
    - MessageBubble.tsx
    - QuerySuggestions.tsx
  /data-upload
    - FileUploader.tsx
    - DataValidator.tsx
    - ProcessingStatus.tsx
```

---

## Functional Requirements

### Phase 1: Core Next.js Application

#### Data Upload and Processing

The application must provide a modern drag-and-drop file upload interface built with React components. File processing should occur both client-side for immediate validation and server-side for comprehensive analysis. The system should support multiple CSV formats from Triton Webcast Metrics with real-time progress indicators and detailed error reporting.

**Upload Features:**
- Drag-and-drop interface with visual feedback
- Multiple file selection and batch processing
- Real-time upload progress with file-by-file status
- Client-side validation before server processing
- Automatic file type detection and format validation

#### Radio Metrics Processing

Server-side API routes must implement proper radio industry calculations with strict adherence to CUME averaging rules. The processing engine should handle large datasets efficiently while maintaining data integrity and providing detailed calculation logs for transparency.

**Calculation Engine:**
```typescript
interface RadioMetrics {
  cume: number; // Always averaged, never summed
  tlh: number;  // Total Listening Hours (can be summed)
  tsl: number;  // Calculated as TLH ÷ CUME
  activeSessions: number;
  date: Date;
  daypart?: string;
  device?: string;
}
```

#### Interactive Dashboard Components

React components should provide responsive, interactive visualizations with smooth animations and real-time updates. Each component must be modular, reusable, and optimized for performance with proper memoization and lazy loading where appropriate.

### Phase 2: Nielsen Integration and Demographic Analysis

#### Nielsen Data Processing API

Next.js API routes must handle Nielsen Vital Signs report parsing and comprehensive demographic data processing with their specific formatting requirements. The API should clean data, standardize formats, and prepare datasets for correlation analysis while maintaining data lineage and audit trails. Demographic processing must handle age groups (6-11 through 65+), gender categories (Male, Female), and ethnic segments (White, Black, Hispanic, Asian, Other) with full performance metrics for each segment.

#### Demographic Data Integration

The platform must process Nielsen demographic composition reports with comprehensive validation and correlation capabilities. Each demographic segment requires processing of AQH Persons, AQH Share, CUME Persons, CUME Percentage, Time Spent Listening, and P1 Percentage data. The system should identify demographic performance patterns, cross-platform engagement differences, and strategic opportunities for audience development.

**API Endpoints:**
```typescript
// /api/nielsen/upload - Handle Nielsen file uploads
// /api/nielsen/process - Process and clean Nielsen data
// /api/nielsen/demographics/upload - Handle demographic data uploads
// /api/nielsen/demographics/process - Process demographic composition data
// /api/correlation/analyze - Perform correlation analysis
// /api/correlation/demographics - Analyze demographic correlations
// /api/insights/generate - Generate strategic insights
// /api/insights/demographics - Generate demographic-specific insights
```

#### Cross-Platform Analytics Engine

The correlation analysis engine should calculate statistical relationships between Nielsen and streaming metrics using server-side processing for performance. Results should be cached and served through optimized API endpoints with proper error handling and rate limiting.

### Phase 3: AI Integration and Chat Interface

#### OpenAI API Integration

Next.js API routes should handle OpenAI integration with proper error handling, rate limiting, and response caching. The AI system must understand radio industry context and provide accurate analysis based on uploaded data.

**AI API Structure:**
```typescript
// /api/ai/query - Process natural language queries
// /api/ai/insights - Generate proactive insights
// /api/ai/recommendations - Create strategic recommendations
```

#### Real-time Chat Interface

React components should provide a modern chat interface with typing indicators, message history, and context awareness. The chat should support rich content including charts, tables, and formatted responses with proper accessibility features.

---

## Component Specifications

### Dashboard Components

#### MetricsOverview Component
```typescript
interface MetricsOverviewProps {
  data: RadioMetrics[];
  dateRange: DateRange;
  selectedDayparts: string[];
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  data,
  dateRange,
  selectedDayparts
}) => {
  // Implementation with proper CUME averaging
  // Real-time metric calculations
  // Responsive card layout
};
```

#### TrendAnalysis Component
```typescript
interface TrendAnalysisProps {
  streamingData: RadioMetrics[];
  nielsenData?: NielsenMetrics[];
  metric: 'cume' | 'tlh' | 'tsl';
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  streamingData,
  nielsenData,
  metric
}) => {
  // Interactive line charts with Recharts
  // Correlation overlays when Nielsen data available
  // Zoom and pan functionality
};
```

### CopilotKit AI Chat Components

#### CopilotKit Integration Setup
```typescript
// Root layout with CopilotKit provider
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}

// Real-time data access for AI
useCopilotReadable({
  description: "Radio Milwaukee multi-station streaming and Nielsen data",
  value: {
    streamingData: filteredStreamingData,
    nielsenData: filteredNielsenData,
    demographicsData: stationDemographics,
    stationMetrics: currentStationData,
    availableStations: radioMilwaukeeStations,
    selectedStation: currentStation
  }
});
```

#### Station-Aware Chat Interface
```typescript
interface StationChatInterfaceProps {
  stations: RadioStation[];
  selectedStation: string;
  dataContext: MultiStationDataContext;
  onStationChange: (stationId: string) => void;
}

const StationChatInterface: React.FC<StationChatInterfaceProps> = ({
  stations,
  selectedStation,
  dataContext,
  onStationChange
}) => {
  // CopilotSidebar with station-specific instructions
  // Multi-station data filtering and comparison
  // Station-specific programming recommendations
};
```

#### Radio Industry Backend Actions
```typescript
// /app/api/copilotkit/route.ts
const runtime = new CopilotRuntime({
  actions: [
    {
      name: "analyzeStationPerformance",
      description: "Analyze radio metrics for specific stations with proper CUME calculations",
      parameters: [
        { name: "stationId", type: "string", required: true },
        { name: "timeframe", type: "string", required: true },
        { name: "metrics", type: "array", required: true }
      ],
      handler: async ({stationId, timeframe, metrics}) => {
        // Secure server-side station analysis
        // Proper CUME averaging validation
        // Cross-station performance comparison
      }
    },
    {
      name: "compareDemographics",
      description: "Compare demographic performance across Radio Milwaukee stations",
      handler: async ({stations, demographic, timeframe}) => {
        // Multi-station demographic analysis
        // Strategic programming insights
      }
    }
  ]
});
```

---

## Data Requirements (Next.js Adapted)

### CSV Processing Pipeline

The Next.js application must handle the same 17 CSV export types from Triton Webcast Metrics with enhanced processing capabilities. Server-side API routes should parse, validate, and transform data while providing real-time feedback to the client.

**Processing Flow:**
1. Client uploads CSV files through React drag-drop interface
2. Server-side API route validates file format and structure
3. Papa Parse processes CSV data with streaming for large files
4. Data transformation applies radio industry calculations
5. Processed data stored in memory or database for analysis
6. Client receives real-time updates on processing status

### Enhanced Data Validation

Next.js API routes should implement comprehensive data validation with detailed error reporting and suggestions for data correction. The validation system should understand Triton export formats and provide specific guidance for common issues.

**Validation Rules:**
- Date format consistency across all exports
- Required columns for each export type
- Numeric validation for metrics with range checking
- Daypart definition validation against industry standards
- Device category standardization

---

## API Design

### RESTful API Structure

```typescript
// Data Management APIs
POST /api/data/upload          // Upload CSV files
GET  /api/data/summary         // Get data summary
POST /api/data/validate        // Validate data format
DELETE /api/data/clear         // Clear uploaded data

// Analytics APIs
GET  /api/analytics/trends     // Get trend analysis
GET  /api/analytics/dayparts   // Get daypart performance
GET  /api/analytics/devices    // Get device analysis
GET  /api/analytics/correlation // Get Nielsen correlation

// AI Integration APIs
POST /api/ai/query            // Process natural language query
GET  /api/ai/suggestions      // Get query suggestions
POST /api/ai/insights         // Generate proactive insights
GET  /api/ai/history          // Get conversation history

// Export APIs
GET  /api/export/dashboard    // Export dashboard as PDF
GET  /api/export/data         // Export processed data
GET  /api/export/insights     // Export AI insights
```

### WebSocket Integration

Real-time features should utilize WebSocket connections for live updates during data processing, AI query responses, and collaborative features if multiple users access the system simultaneously.

---

## User Experience Design

### Responsive Design Requirements

The Next.js application must provide optimal experiences across all device sizes using Tailwind CSS responsive utilities. The interface should adapt gracefully from desktop dashboards to mobile-friendly views while maintaining full functionality.

**Breakpoint Strategy:**
- Mobile (320px-768px): Stacked layouts, simplified charts, touch-optimized interactions
- Tablet (768px-1024px): Hybrid layouts, medium-complexity visualizations
- Desktop (1024px+): Full dashboard layouts, complex multi-chart views

### Accessibility Standards

All components must meet WCAG 2.1 AA standards with proper ARIA labels, keyboard navigation, and screen reader support. Charts and visualizations should include alternative text descriptions and data tables for accessibility.

### Performance Optimization

The application should implement Next.js performance best practices including:
- Image optimization with next/image
- Code splitting and lazy loading for dashboard components
- Static generation for documentation pages
- API route caching for frequently accessed data
- Client-side caching with React Query or SWR

---

## Development Workflow

### Project Setup

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest radio-milwaukee-analytics --typescript --tailwind --app

# Install additional dependencies
npm install recharts papaparse openai @types/papaparse
npm install -D @types/node

# Development server
npm run dev
```

### Component Development Standards

All components should be developed with TypeScript for type safety, include comprehensive prop interfaces, implement proper error boundaries, and follow React best practices for performance and maintainability.

**Component Template:**
```typescript
interface ComponentProps {
  // Properly typed props
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component implementation with hooks
  // Error handling
  // Performance optimization
  
  return (
    // JSX with proper accessibility
  );
};

export default Component;
```

---

## Deployment and Infrastructure

### Deployment Options

**Vercel (Recommended)**: Seamless Next.js deployment with automatic CI/CD, edge functions, and global CDN distribution.

**AWS**: Deploy using AWS Amplify, EC2, or containerized solutions with proper scaling and monitoring.

**Self-Hosted**: Docker containerization for on-premises deployment with proper security and backup procedures.

### Environment Configuration

```typescript
// Environment variables for different deployment stages
NEXT_PUBLIC_APP_URL=https://analytics.radiomilwaukee.org
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://analytics.radiomilwaukee.org
```

### Security Considerations

The Next.js application must implement proper security measures including API route authentication, CORS configuration, input validation and sanitization, secure file upload handling, and environment variable protection.

---

## Testing Strategy

### Component Testing

React components should be tested using Jest and React Testing Library with comprehensive test coverage for user interactions, data processing, and error scenarios.

### API Testing

Next.js API routes require thorough testing including unit tests for business logic, integration tests for external API calls, and end-to-end tests for complete workflows.

### Performance Testing

The application should undergo performance testing including load testing for file uploads, stress testing for large datasets, and user experience testing across different devices and network conditions.

---

## Migration from Taipy

### Advantages of Next.js Implementation

**Better Performance**: Server-side rendering and static generation provide faster initial page loads and better SEO.

**Modern Development Experience**: TypeScript, hot reloading, and extensive tooling ecosystem improve developer productivity.

**Flexible Deployment**: Multiple deployment options from serverless to traditional hosting with better scaling capabilities.

**Enhanced UI/UX**: React ecosystem provides more sophisticated UI components and interaction patterns.

**Better Mobile Experience**: Responsive design and progressive web app capabilities for mobile users.

### Implementation Considerations

The migration to Next.js requires restructuring the application architecture while maintaining all existing functionality. Data processing logic can be adapted from Python to TypeScript/JavaScript, and visualization components can be rebuilt using React-based charting libraries.

**Key Migration Steps:**
1. Convert Python data processing to TypeScript API routes
2. Rebuild Taipy components as React components
3. Implement OpenAI integration in Next.js API routes
4. Create responsive layouts with Tailwind CSS
5. Add comprehensive testing and deployment pipelines

---

## Success Metrics and KPIs

### Technical Performance

**Page Load Speed**: Target under 2 seconds for initial page load and under 500ms for subsequent navigation.

**API Response Times**: Data processing APIs should complete within 5 seconds for standard CSV files, AI queries within 10 seconds.

**Uptime and Reliability**: Maintain 99.9% uptime with proper error handling and graceful degradation.

### User Experience

**User Adoption**: Target 90% of program directors actively using the platform within 2 months of deployment.

**Feature Utilization**: AI chat feature usage in 40% of sessions, indicating successful adoption of natural language querying.

**Mobile Usage**: Support 25% of usage from mobile/tablet devices with full functionality.

---

## Future Enhancements

### Progressive Web App Features

Implement PWA capabilities including offline data access, push notifications for alerts, and app-like installation experience for desktop and mobile users.

### Advanced Analytics

Add machine learning capabilities for predictive analytics, automated anomaly detection, and intelligent recommendation systems using TensorFlow.js or server-side ML models.

### Real-time Data Integration

Implement real-time data streaming from Triton APIs for live dashboard updates and immediate alert notifications.

### Collaborative Features

Add multi-user support with role-based access control, shared dashboards, and collaborative analysis features for team decision-making.

---

## Conclusion

The Next.js implementation of the Radio Milwaukee Streaming Analytics Platform provides a modern, scalable, and maintainable solution for radio programming analytics. The technology stack offers superior performance, developer experience, and deployment flexibility while maintaining all the radio industry expertise and AI capabilities of the original design.

The component-based architecture ensures maintainability and extensibility, while the API-first design enables future integrations and mobile applications. The comprehensive testing strategy and multiple deployment options provide confidence in production reliability and scalability.

This Next.js implementation positions Radio Milwaukee with a cutting-edge analytics platform that can evolve with changing technology needs while providing immediate value for programming decision-making and audience development strategies.
