// Radio Milwaukee Analytics Type Definitions

export interface RadioMetrics {
  cume: number; // Always averaged, never summed
  tlh: number; // Total Listening Hours (can be summed)
  tsl: number; // Time Spent Listening - calculated as TLH ÷ CUME
  activeSessions: number;
  date: Date;
  daypart?: string;
  device?: string;
  station?: string; // Station identifier for filtering
  hour?: number; // Hour of day (0-23) for hourly pattern analysis
  fileId?: string; // Track which file this metric came from
}

export interface NielsenMetrics {
  aqhShare: number; // AQH Share percentage
  aqhPersons: number; // Average Quarter Hour Persons
  cume: number; // Cumulative Audience
  cumePercentage?: number;
  tsl: number; // Time Spent Listening
  p1Percentage?: number; // P1 Percentage
  date: Date;
  daypart?: string;
  demographic?: DemographicSegment;
}

export interface DemographicSegment {
  ageGroup?: string; // e.g., "18-34", "35-54", "55+"
  gender?: "Male" | "Female" | "All";
  ethnicity?: "White" | "Black" | "Hispanic" | "Asian" | "Other" | "All";
}

export interface DataContext {
  streamingData: RadioMetrics[];
  nielsenData?: NielsenMetrics[];
  uploadedFiles: UploadedFile[];
  lastUpdated: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: "triton" | "nielsen" | "demographics";
  uploadedAt: Date;
  recordCount: number;
  status: "processing" | "completed" | "error";
  errorMessage?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ChartDataPoint {
  date: string;
  cume?: number;
  tlh?: number;
  tsl?: number;
  nielsenCume?: number;
  [key: string]: string | number | undefined;
}

export type DaypartType = "Morning Drive" | "Midday" | "Afternoon Drive" | "Evening" | "Overnight" | "Weekend";
export type DeviceType = "Mobile" | "Desktop" | "Tablet" | "Smart Speaker" | "Connected TV" | "Other";

export interface CorrelationAnalysis {
  coefficient: number; // Pearson correlation coefficient
  significance: number; // P-value
  metric1: string;
  metric2: string;
  dataPoints: number;
}
