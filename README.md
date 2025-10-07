# Radio Milwaukee Canvas Dashboard Builder

AI-powered infinite canvas dashboard builder for radio streaming analytics. Upload CSV data, use natural language to create visualizations, and build custom dashboards on an infinite canvas powered by tldraw and Thesys C1 generative UI.

## 🎨 What We Built

A **canvas-based dashboard builder** where you can:
- Upload CSV files with radio streaming metrics to Supabase
- Use **Cmd+K** (or Ctrl+K) to summon AI chat
- Ask for charts in natural language (e.g., "Show CUME trends")
- AI generates live, interactive visualizations using **Thesys C1**
- Drag, resize, and arrange cards on an **infinite canvas** (tldraw)
- Dark mode interface matching Radio Milwaukee brand colors

### Key Features

- 📊 **AI-Generated Dashboards** - Natural language → beautiful charts
- 🎨 **Infinite Canvas** - Unlimited workspace powered by tldraw
- 🤖 **C1 Generative UI** - AI creates React components on-the-fly
- 📁 **Supabase Storage** - Persistent CSV data storage
- 🎯 **Multi-Turn Tool Calling** - AI chains multiple data queries
- 🎨 **Dark Mode** - Custom Radio Milwaukee charcoal/orange/cream theme
- ⌨️ **Keyboard Shortcuts** - Cmd+K for instant AI access

## 🏗️ Architecture

### Core Technologies

**Frontend:**
- **Next.js 14** - App Router with TypeScript
- **tldraw** - Infinite canvas library for draggable custom shapes
- **Thesys C1** - AI-powered generative UI for creating visualizations
- **Tailwind CSS** - Utility-first styling with custom brand colors

**Backend:**
- **Supabase** - PostgreSQL database for CSV storage
- **OpenAI Function Calling** - Multi-turn tool chaining
- **Edge Runtime** - Streaming AI responses

**AI Integration:**
- **Thesys C1 API** - Claude Sonnet 4 with generative UI capabilities
- **Function Calling** - `list_available_tables` + `query_radio_data`
- **Streaming Responses** - Real-time UI generation

### How It Works

```
┌─────────────────┐
│  User uploads   │
│  CSV to app     │
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│ Supabase Table Created  │
│ radio_milwaukee_*       │
└────────┬────────────────┘
         │
         v
┌──────────────────────────────┐
│ User presses Cmd+K           │
│ "Show CUME trends"           │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────────┐
│ C1 AI (Claude Sonnet 4):        │
│ 1. Calls list_available_tables   │
│ 2. Calls query_radio_data        │
│ 3. Generates C1 GenUI DSL        │
└────────┬─────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ C1Component renders React UI     │
│ (charts, cards, metrics)         │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ Card appears on tldraw canvas   │
│ User can drag/resize/arrange    │
└─────────────────────────────────┘
```

## 🎯 Canvas Workflow

### 1. Upload Data
Click "Upload CSV" button → Select file → Data saved to Supabase

### 2. Create Visualizations
Press **Cmd+K** → Type natural language request → AI generates chart

### 3. Arrange Dashboard
- Drag cards around infinite canvas
- Resize cards by dragging corners
- Pan/zoom with mouse or trackpad
- Use tldraw toolbar for drawing annotations

### 4. Multiple Pages
Create tabs with "Page 1" dropdown for organizing different dashboard views

## 🎨 Custom Canvas Components

### C1CardShape (tldraw Custom Shape)

Located in `components/canvas/C1CardShape.tsx`:

```typescript
export type C1CardShape = TLBaseShape<
  'c1Card',
  {
    w: number;          // Width
    h: number;          // Height
    prompt: string;     // User's AI request
    response?: string;  // C1's generated UI
  }
>;
```

**Features:**
- Streams AI response in real-time
- Decodes HTML entities from C1 API
- Renders C1Component with GenUI DSL
- Dark mode with brand colors
- Loading states and error handling

### Canvas Architecture

**File: `components/canvas/CanvasWorkspace.tsx`**
- Wraps tldraw with custom shape utilities
- Registers C1CardShapeUtil
- Handles editor mounting

**File: `app/page.tsx`**
- Main dashboard UI
- Radio Milwaukee branded header
- Cmd+K keyboard shortcut handler
- Upload modal integration
- Canvas workspace container

## 🔧 API Routes

### `/api/chat` - C1 Streaming API

**Handles:**
- Multi-turn tool calling (list tables → query data → generate UI)
- Streams responses from Thesys C1
- HTML entity decoding
- Tool execution (`list_available_tables`, `query_radio_data`)

**Multi-Turn Flow:**
1. Initial request → C1 returns tool calls
2. Execute tools → append results to conversation
3. Second request → C1 may return more tool calls
4. Execute tools → append results
5. Final request → C1 streams GenUI DSL

### `/api/tools/list-tables` - Table Discovery

Returns list of tables in Supabase by querying known table names.

### `/api/tools/query-data` - Data Retrieval

Fetches actual CSV data from Supabase tables with filters and limits.

### `/api/supabase/upload-csv` - File Upload

**Features:**
- Parses CSV with PapaParse
- Creates Supabase table if doesn't exist
- **Appends data** instead of replacing
- Returns metadata (row count, columns, etc.)

## 🎨 Dark Mode Theme

Custom Radio Milwaukee brand colors applied throughout:

```css
--charcoal: #1F2528     /* Canvas background */
--charcoal-600: #2A3135 /* UI panels */
--cream: #F7F1DB        /* Text */
--orange: #F8971D       /* Accents */
--blue: #32588E         /* Secondary accents */
```

**Styled Components:**
- tldraw canvas (dark background, cream UI)
- C1 cards (dark with orange border + glow)
- Command palette (dark modal with orange button)
- Top navigation bar (Radio Milwaukee logo)

## 📦 Installation

### Prerequisites

- Node.js 18+
- Supabase account
- Thesys API key

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/radiomilwaukee/ratings.git
cd ratings
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create `.env.local`:
```bash
# Thesys C1 API
THESYS_API_KEY=your_thesys_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🗂️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/                 # C1 streaming API
│   │   ├── tools/                # Data query tools
│   │   └── supabase/             # CSV upload
│   ├── page.tsx                  # Main canvas dashboard
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Dark mode theme
├── components/
│   ├── canvas/
│   │   ├── CanvasWorkspace.tsx   # tldraw wrapper
│   │   ├── C1CardShape.tsx       # Custom shape for AI cards
│   │   ├── CommandPalette.tsx    # Cmd+K modal
│   │   └── UploadModal.tsx       # CSV upload UI
│   └── chat/                     # Legacy chat components
├── lib/
│   └── supabase/
│       ├── client.ts             # Supabase client
│       └── admin.ts              # Admin client
└── contexts/
    └── UploadedFilesContext.tsx  # File state management
```

## 🎯 Key Dependencies

```json
{
  "tldraw": "^2.4.0",           // Infinite canvas
  "@thesysai/genui-sdk": "*",   // C1 UI components
  "@supabase/supabase-js": "*", // Database
  "openai": "^4.0.0",           // C1 API client
  "papaparse": "^5.4.1",        // CSV parsing
  "lucide-react": "*",          // Icons
  "tailwindcss": "^3.4.1"       // Styling
}
```

## 🚀 Usage Guide

### Upload CSV Data

1. Click **"Upload CSV"** button (top right)
2. Select file with radio metrics
3. Table created automatically in Supabase
4. See confirmation message with row count

**Required CSV Columns:**
- Date or Week
- Station name
- CUME (cumulative audience)
- TLH (total listening hours)
- Any other metrics

### Create Visualizations

1. Press **Cmd+K** (or Ctrl+K on Windows/Linux)
2. Type natural language request:
   - "Show CUME trends"
   - "Compare stations by TLH"
   - "Device breakdown"
   - "Top 10 days by listeners"
3. AI generates chart in ~3-5 seconds
4. Card appears on canvas

### Arrange Dashboard

- **Drag cards:** Click and drag to reposition
- **Resize cards:** Drag corner handles
- **Pan canvas:** Click empty space and drag
- **Zoom:** Pinch trackpad or Ctrl+scroll
- **Delete cards:** Select and press Delete/Backspace

### Canvas Tools (Bottom Toolbar)

- Select/move
- Draw shapes
- Add text
- Insert images
- More tldraw features

## 🔮 What's Next

### Coming Features (Not Yet Implemented)

- [ ] **Dashboard Persistence** - Save/load canvas state to Supabase
- [ ] **Multiple Dashboards** - Create named dashboards ("Q1 Report", etc.)
- [ ] **Auto-save** - Background saving every 3 seconds
- [ ] **Dashboard Sharing** - Export/share links
- [ ] **More Chart Types** - Time series, heatmaps, etc.
- [ ] **Data Refresh** - Re-query on demand
- [ ] **Collaboration** - Multi-user editing

See implementation plan in code for details.

## 🎨 Thesys C1 Integration

C1 is an AI system that generates React UI components from natural language. We use it to create data visualizations dynamically.

**How C1 Works:**

1. User asks: "Show CUME trends"
2. C1 calls tools to fetch data
3. C1 generates a GenUI DSL (JSON structure)
4. `C1Component` renders the DSL as React

**Example C1 DSL:**
```json
{
  "component": {
    "type": "Card",
    "props": {
      "title": "CUME Trends Analysis"
    },
    "children": [
      {
        "type": "LineChart",
        "props": {
          "data": [...],
          "xKey": "date",
          "yKey": "cume"
        }
      }
    ]
  }
}
```

## 📚 Learn More

- [tldraw Documentation](https://tldraw.dev/docs)
- [Thesys C1 Docs](https://docs.thesys.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

This is a proprietary project for Radio Milwaukee. For internal development questions, contact the team.

## 📝 License

Proprietary - Radio Milwaukee

## 🎙️ Radio Milwaukee

This dashboard builder is designed specifically for Radio Milwaukee's streaming analytics needs, with industry-standard radio metrics and Nielsen correlation capabilities.

**Important Radio Metrics Rules:**
- ✅ CUME is always **averaged**, never summed
- ✅ TLH (Total Listening Hours) can be summed
- ✅ TSL = TLH ÷ CUME
- ✅ AQH (Average Quarter Hour) represents average listeners

The AI assistant follows these rules automatically.

---

🎨 **Built with tldraw + Thesys C1 + Next.js** | 📊 **Powered by AI** | 🎙️ **Made for Radio Milwaukee**
