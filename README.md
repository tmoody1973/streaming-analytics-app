# Radio Milwaukee Streaming Analytics Platform

Next.js 14 application for analyzing streaming metrics from Triton Webcast and correlating with Nielsen ratings data. Features AI-powered insights through CopilotKit integration.

## Features

- 📊 **Real-time Analytics Dashboard** - Interactive visualizations with Recharts
- 📁 **CSV Data Processing** - Support for Triton Webcast and Nielsen exports
- 🤖 **AI-Powered Assistant** - CopilotKit integration for natural language queries
- 📈 **Trend Analysis** - Comprehensive daypart and device performance tracking
- 🎯 **Proper Radio Metrics** - CUME averaging (never summing) per industry standards
- 🔗 **Nielsen Integration** - Correlation analysis between streaming and broadcast data
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **CSV Processing**: PapaParse
- **AI Integration**: CopilotKit + OpenAI
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/radiomilwaukee/ratings.git
cd ratings
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   └── copilotkit/   # CopilotKit AI endpoint
│   ├── layout.tsx        # Root layout with CopilotKit provider
│   ├── page.tsx          # Main dashboard page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── dashboard/        # Dashboard components
│   ├── charts/           # Chart components
│   ├── ai-chat/          # AI chat interface
│   └── data-upload/      # File upload components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
│   └── index.ts          # Radio metrics types
├── public/                # Static assets
└── docs/                  # Documentation
    └── radiomke_data_prd.md  # Product requirements
```

## Key TypeScript Interfaces

### RadioMetrics
```typescript
interface RadioMetrics {
  cume: number;          // Always averaged, never summed
  tlh: number;           // Total Listening Hours (can be summed)
  tsl: number;           // Time Spent Listening (TLH ÷ CUME)
  activeSessions: number;
  date: Date;
  daypart?: string;
  device?: string;
}
```

### NielsenMetrics
```typescript
interface NielsenMetrics {
  aqhShare: number;      // AQH Share percentage
  aqhPersons: number;    // Average Quarter Hour Persons
  cume: number;          // Cumulative Audience
  tsl: number;           // Time Spent Listening
  date: Date;
  daypart?: string;
  demographic?: DemographicSegment;
}
```

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Important Radio Industry Rules

⚠️ **CUME Calculation**: CUME values must ALWAYS be averaged, never summed. This is a fundamental rule in radio analytics.

The AI assistant is trained to follow this rule and will calculate metrics correctly.

## Deployment

The application is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Next Steps

- [ ] Implement CSV file upload component
- [ ] Build dashboard visualization components
- [ ] Create Nielsen data processing API routes
- [ ] Add correlation analysis engine
- [ ] Implement demographic analysis features
- [ ] Add export functionality (PDF, CSV)

## Documentation

See [docs/radiomke_data_prd.md](docs/radiomke_data_prd.md) for complete product requirements and specifications.

## License

Proprietary - Radio Milwaukee

## Support

For issues or questions, contact the development team.
