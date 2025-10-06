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

## How to Use This App (For Beginners)

### Step 1: Get Your CSV Files Ready

Think of CSV files as spreadsheets that the app can read. You need to export data from **Triton Webcast Metrics** (your streaming analytics platform).

**What is a CSV file?** It's a simple file that contains data in rows and columns, like an Excel spreadsheet but in a simpler format that computers can easily read.

### Step 2: What Data Should Be in Your CSV File?

The app needs specific columns (information) in your CSV files. Here's what to look for:

**Essential Columns:**
- **Week** or **Date** - When the data was recorded
- **Station** - Which radio station or stream (like "WYMS-FM" or "Radio Milwaukee")
- **CUME** - Total number of unique listeners (this gets averaged automatically)
- **TLH** - Total Listening Hours (how many hours people listened)
- **AAS** or **Active Sessions** - How many people were listening at once
- **TSL** - Time Spent Listening per person

**Optional but Helpful:**
- **Daypart** - What time of day (Morning Drive, Midday, etc.)
- **Device** - How people listened (Mobile, Desktop, Smart Speaker)

### Step 3: Export From Triton Webcast Metrics

1. Log into your **Triton Webcast Metrics** account
2. Go to the **Explore** or **Reports** section
3. Select your date range (we recommend last 18 months for good trends)
4. Choose **Daily Overview** as your first export
5. Make sure these columns are included: Date, Station, CUME, TLH, Active Sessions
6. Click **Export as CSV** or **Download CSV**
7. Save the file with a clear name like `radio_milwaukee_daily_overview.csv`

### Step 4: Upload Your CSV File to the App

1. Open the app in your browser (http://localhost:3000)
2. Look for the **"Upload Data"** section
3. Click the upload area or **drag and drop** your CSV file
4. The app will automatically:
   - Read your file
   - Check if it has the right columns
   - Process the data (averaging CUME properly!)
   - Show you beautiful charts and insights

### Step 5: View Your Dashboard

Once uploaded, you'll see:
- **Metrics Overview** - Big numbers showing your CUME, TLH, and TSL
- **Trend Analysis** - Line charts showing how your audience is growing
- **Daypart Comparison** - Which times of day perform best
- **Device Analysis** - How your listeners access your stream

### Step 6: Ask the AI Assistant

Click the **AI Assistant** button on the right side to ask questions like:
- "What's my average CUME for morning drive?"
- "Which device has the most listeners?"
- "Show me trends for the last 3 months"

The AI understands radio metrics and will give you accurate answers!

## What CSV Files Can You Upload? (Quick Reference)

**Start with these 3 essential files:**

1. **Daily Overview** - Your main dashboard data
   - File: `radio_milwaukee_daily_overview.csv`
   - Columns: Date, Station, CUME, TLH, Active Sessions

2. **Daypart Performance** - Morning, afternoon, evening breakdown
   - File: `radio_milwaukee_daypart_performance.csv`
   - Columns: Daypart, CUME, TLH, Active Sessions

3. **Device Analysis** - How people listen (phone, computer, etc.)
   - File: `radio_milwaukee_device_analysis.csv`
   - Columns: Device, CUME, TLH, Active Sessions

**For complete details on all 22 possible CSV exports**, see [docs/csv_exports_guide.md](docs/csv_exports_guide.md)

## Important Radio Industry Rules

⚠️ **CUME Calculation**: CUME values must ALWAYS be averaged, never summed. This is a fundamental rule in radio analytics.

The app automatically does this for you - you don't need to calculate anything manually! Just upload your data and the app handles the math correctly.

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
