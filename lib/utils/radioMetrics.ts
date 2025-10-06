import type { RadioMetrics, NielsenMetrics } from "@/types";

/**
 * CRITICAL: CUME Averaging Rules
 * CUME (Cumulative Audience) represents UNIQUE listeners
 * CUME values must ALWAYS be AVERAGED, NEVER summed
 * This is a fundamental rule in radio analytics
 */

export function calculateAverageCUME(cumeValues: number[]): number {
  const validValues = cumeValues.filter((v) => !isNaN(v) && v > 0);
  if (validValues.length === 0) return 0;

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / validValues.length);
}

/**
 * Calculate Time Spent Listening (TSL)
 * Formula: TSL = TLH ÷ CUME
 * TSL represents average listening duration per unique listener
 */
export function calculateTSL(tlh: number, cume: number): number {
  if (cume === 0 || isNaN(cume) || isNaN(tlh)) return 0;
  return parseFloat((tlh / cume).toFixed(2));
}

/**
 * Validate radio metrics data
 */
export function validateRadioMetrics(data: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (data.cume === undefined && data.CUME === undefined) {
    errors.push("Missing CUME value");
  }

  if (data.tlh === undefined && data.TLH === undefined) {
    errors.push("Missing TLH (Total Listening Hours) value");
  }

  // Validate CUME is not negative
  const cume = data.cume || data.CUME;
  if (cume !== undefined && cume < 0) {
    errors.push("CUME cannot be negative");
  }

  // Validate TLH is not negative
  const tlh = data.tlh || data.TLH;
  if (tlh !== undefined && tlh < 0) {
    errors.push("TLH cannot be negative");
  }

  // Warning if TSL seems unusual (outside 0-8 hours typical range)
  if (cume > 0 && tlh > 0) {
    const tsl = tlh / cume;
    if (tsl > 8) {
      warnings.push(`Unusually high TSL: ${tsl.toFixed(2)} hours - verify data accuracy`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parse Triton CSV data into RadioMetrics
 */
export function parseTritonMetrics(csvData: any[]): RadioMetrics[] {
  const metrics: RadioMetrics[] = [];

  csvData.forEach((row, index) => {
    try {
      // Handle various column name formats (case-insensitive)
      const getCellValue = (row: any, possibleNames: string[]): any => {
        for (const name of possibleNames) {
          const exactMatch = row[name];
          if (exactMatch !== undefined && exactMatch !== "") return exactMatch;

          // Try case-insensitive match
          const key = Object.keys(row).find(
            (k) => k.toLowerCase() === name.toLowerCase()
          );
          if (key && row[key] !== "") return row[key];
        }
        return undefined;
      };

      const cume = parseFloat(
        getCellValue(row, ["CUME", "Cume", "cume", "Cumulative Audience"]) || "0"
      );
      const tlh = parseFloat(
        getCellValue(row, ["TLH", "Tlh", "tlh", "Total Listening Hours"]) || "0"
      );

      // AAS (Average Active Sessions) is similar to Active Sessions
      const activeSessions = parseFloat(
        getCellValue(row, ["AAS", "Active Sessions", "ActiveSessions", "Sessions", "SS"]) || "0"
      );

      // Handle date from "Week" column (Triton uses "Week" for date)
      const dateStr = getCellValue(row, ["Week", "Date", "date", "DATE"]);
      const date = dateStr ? new Date(dateStr) : new Date();

      // Station name
      const station = getCellValue(row, ["Station", "station", "STATION"]);

      const daypart = getCellValue(row, ["Daypart", "daypart", "DAYPART"]) || undefined;
      const device = getCellValue(row, ["Device", "device", "DEVICE"]) || station || undefined;

      const validation = validateRadioMetrics({ cume, tlh });

      if (validation.isValid) {
        metrics.push({
          cume,
          tlh,
          tsl: calculateTSL(tlh, cume),
          activeSessions,
          date,
          daypart,
          device,
        });
      } else {
        console.warn(`Row ${index + 1} validation failed:`, validation.errors);
      }
    } catch (error) {
      console.warn(`Error parsing row ${index + 1}:`, error);
    }
  });

  return metrics;
}

/**
 * Parse Nielsen CSV data into NielsenMetrics
 */
export function parseNielsenMetrics(csvData: any[]): NielsenMetrics[] {
  const metrics: NielsenMetrics[] = [];

  csvData.forEach((row, index) => {
    try {
      const getCellValue = (row: any, possibleNames: string[]): any => {
        for (const name of possibleNames) {
          const exactMatch = row[name];
          if (exactMatch !== undefined) return exactMatch;

          const key = Object.keys(row).find(
            (k) => k.toLowerCase() === name.toLowerCase()
          );
          if (key) return row[key];
        }
        return undefined;
      };

      const aqhShare = parseFloat(
        getCellValue(row, ["AQH Share", "AQHShare", "Share"]) || "0"
      );
      const aqhPersons = parseFloat(
        getCellValue(row, ["AQH Persons", "AQHPersons", "AQH"]) || "0"
      );
      const cume = parseFloat(
        getCellValue(row, ["CUME", "Cume", "Cumulative Persons"]) || "0"
      );
      const tsl = parseFloat(
        getCellValue(row, ["TSL", "Time Spent Listening"]) || "0"
      );

      const dateStr = getCellValue(row, ["Date", "date", "Survey Period"]);
      const date = dateStr ? new Date(dateStr) : new Date();

      const daypart = getCellValue(row, ["Daypart", "daypart"]) || undefined;

      metrics.push({
        aqhShare,
        aqhPersons,
        cume,
        tsl,
        date,
        daypart,
      });
    } catch (error) {
      console.warn(`Error parsing Nielsen row ${index + 1}:`, error);
    }
  });

  return metrics;
}

/**
 * Aggregate metrics by time period with proper CUME averaging
 */
export function aggregateMetricsByPeriod(
  metrics: RadioMetrics[],
  period: "daily" | "weekly" | "monthly"
): RadioMetrics[] {
  const groups = new Map<string, RadioMetrics[]>();

  metrics.forEach((metric) => {
    const date = new Date(metric.date);
    let key: string;

    switch (period) {
      case "daily":
        key = date.toISOString().split("T")[0];
        break;
      case "weekly":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "monthly":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(metric);
  });

  const aggregated: RadioMetrics[] = [];

  groups.forEach((groupMetrics, key) => {
    // CRITICAL: Average CUME, sum TLH
    const cumeValues = groupMetrics.map((m) => m.cume);
    const avgCume = calculateAverageCUME(cumeValues);

    const totalTlh = groupMetrics.reduce((sum, m) => sum + m.tlh, 0);
    const totalSessions = groupMetrics.reduce((sum, m) => sum + m.activeSessions, 0);

    aggregated.push({
      cume: avgCume,
      tlh: totalTlh,
      tsl: calculateTSL(totalTlh, avgCume),
      activeSessions: totalSessions,
      date: new Date(key),
    });
  });

  return aggregated.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Detect CSV data type (Triton or Nielsen)
 */
export function detectCSVType(headers: string[]): "triton" | "nielsen" | "unknown" {
  const headerLower = headers.map((h) => h.toLowerCase());

  // Triton indicators - AAS, Week, Station are common in Triton exports
  const tritonIndicators = ["aas", "active sessions", "activesessions", "week", "station"];
  if (tritonIndicators.some((indicator) => headerLower.includes(indicator))) {
    return "triton";
  }

  // Nielsen indicators
  const nielsenIndicators = ["aqh share", "aqhshare", "aqh persons"];
  if (nielsenIndicators.some((indicator) => headerLower.includes(indicator))) {
    return "nielsen";
  }

  // Check for common radio metrics
  const hasCommonMetrics =
    headerLower.includes("cume") && headerLower.includes("tlh");

  return hasCommonMetrics ? "triton" : "unknown";
}
