# Required CSV Exports from Triton Webcast Metrics

This document provides a complete list of the CSV files you need to export from Triton Webcast Metrics to make the Radio Milwaukee Taipy application fully functional for program director decision-making.

## Export Strategy

Create **separate CSV exports** for each analysis type. This approach ensures clean data and optimal performance in the Taipy application.

---

## 1. **Daily Overview Export** (Primary Dashboard Data)
**Purpose:** Main dashboard metrics and trend analysis

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee (all streams)
  - Date Range: Last 18 Months (or custom range)
  - Daypart: All Times
- **Dimensions:** 
  - Date (daily breakdown)
- **File Name:** `radio_milwaukee_daily_overview.csv`

### Expected Columns:
- Date
- CUME
- TLH (Total Listening Hours)
- Active Sessions
- AAS (Average Active Sessions)

---

## 2. **Daypart Performance Export**
**Purpose:** Compare performance across different time periods

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - Daypart: All Times
- **Dimensions:** 
  - Daypart (Morning Drive, Mid-Day, Afternoon Drive, Evening, etc.)
- **File Name:** `radio_milwaukee_daypart_performance.csv`

### Expected Columns:
- Daypart
- CUME
- TLH
- Active Sessions
- TSL (if available)

---

## 3. **Day of Week Analysis Export**
**Purpose:** Understand weekly listening patterns

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months (for comprehensive weekly patterns)
  - Daypart: All Times
- **Dimensions:** 
  - Day of Week
- **File Name:** `radio_milwaukee_day_of_week.csv`

### Expected Columns:
- Day of Week
- CUME
- TLH
- Active Sessions

---

## 4. **Device/Platform Analysis Export**
**Purpose:** Understand how listeners access your streams

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - Daypart: All Times
- **Dimensions:** 
  - Device Family (or Platform)
- **File Name:** `radio_milwaukee_device_analysis.csv`

### Expected Columns:
- Device Family (Desktop, Mobile, Smart Speaker, etc.)
- CUME
- TLH
- Active Sessions

---

## 5. **Hourly Listening Patterns Export**
**Purpose:** Identify peak listening hours for programming decisions

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - Daypart: All Times
- **Dimensions:** 
  - Hour of Day
- **File Name:** `radio_milwaukee_hourly_patterns.csv`

### Expected Columns:
- Hour of Day (0-23)
- CUME
- TLH
- Active Sessions

---

## 6. **Geographic Distribution Export** (If Available)
**Purpose:** CUME map visualization

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - Daypart: All Times
- **Dimensions:** 
  - Country, State/Region, or City (whichever is available)
- **File Name:** `radio_milwaukee_geographic.csv`

### Expected Columns:
- Geographic Location (Country/State/City)
- CUME
- TLH
- Active Sessions

---

## 7. **Stream Comparison Export** (If Multiple Streams)
**Purpose:** Compare performance across different Radio Milwaukee streams

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group: Radio Milwaukee (select all stations/streams)
  - Date Range: Last 18 Months
  - Daypart: All Times
- **Dimensions:** 
  - Station/Stream Name
- **File Name:** `radio_milwaukee_stream_comparison.csv`

### Expected Columns:
- Station/Stream Name
- CUME
- TLH
- Active Sessions

---

## 8. **Monthly Trend Export**
**Purpose:** Long-term trend analysis for strategic planning

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 12 Months
  - Daypart: All Times
- **Dimensions:** 
  - Month/Year
- **File Name:** `radio_milwaukee_monthly_trends.csv`

### Expected Columns:
- Month/Year
- CUME
- TLH
- Active Sessions

---

## 9. **Daypart by Device Cross-Analysis Export**
**Purpose:** Advanced analysis of how device usage varies by daypart

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - Daypart: All Times
- **Dimensions:** 
  - Daypart (first dimension)
  - Device Family (second dimension)
- **File Name:** `radio_milwaukee_daypart_device_cross.csv`

### Expected Columns:
- Daypart
- Device Family
- CUME
- TLH
- Active Sessions

---

## 10. **Weekend vs Weekday Export**
**Purpose:** Compare weekend and weekday performance

### Create Two Separate Exports:

### Weekday Export:
- **Custom Daypart:** Monday-Friday, All Hours
- **File Name:** `radio_milwaukee_weekday.csv`

### Weekend Export:
- **Custom Daypart:** Saturday-Sunday, All Hours
- **File Name:** `radio_milwaukee_weekend.csv`

---

## Export Checklist

Before uploading to the Taipy app, ensure each CSV file contains:

- [ ] **Date/Time columns** in a recognizable format
- [ ] **CUME column** (will be averaged automatically)
- [ ] **TLH column** (will be summed automatically)
- [ ] **Active Sessions column** (will be summed automatically)
- [ ] **Dimension columns** (Daypart, Device, etc.)
- [ ] **No missing headers** or empty rows at the top
- [ ] **Consistent naming** across files

## File Naming Convention

Use this naming pattern for easy identification:
```
radio_milwaukee_[analysis_type]_[date_range].csv
```

Examples:
- `radio_milwaukee_daily_overview_last30days.csv`
- `radio_milwaukee_daypart_performance_last30days.csv`
- `radio_milwaukee_device_analysis_last30days.csv`

## Upload Order Recommendation

For best results, upload files in this order:
1. Daily Overview (primary data)
2. Daypart Performance
3. Device Analysis
4. Day of Week Analysis
5. Additional analysis files as needed

This ensures the main dashboard populates first, then additional analysis features become available as you upload more specific data files.


---

## Daypart-Specific CSV Exports

### 11. **Morning Drive Export** (6AM-10AM)
**Purpose:** Analyze peak morning commute performance

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - **Daypart: Morning Drive (6AM-10AM)**
- **Dimensions:** 
  - Date (daily breakdown)
  - Hour of Day (6, 7, 8, 9)
- **File Name:** `radio_milwaukee_morning_drive_6am_10am.csv`

### Expected Columns:
- Date
- Hour of Day
- CUME
- TLH
- Active Sessions
- Device Family (if available)

---

### 12. **Midday Export** (10AM-3PM)
**Purpose:** Analyze midday listening patterns and at-work audience

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - **Daypart: Midday (10AM-3PM)**
- **Dimensions:** 
  - Date (daily breakdown)
  - Hour of Day (10, 11, 12, 13, 14)
- **File Name:** `radio_milwaukee_midday_10am_3pm.csv`

### Expected Columns:
- Date
- Hour of Day
- CUME
- TLH
- Active Sessions
- Device Family (if available)

---

### 13. **Afternoon Drive Export** (3PM-7PM)
**Purpose:** Analyze afternoon commute and after-school performance

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - **Daypart: Afternoon Drive (3PM-7PM)**
- **Dimensions:** 
  - Date (daily breakdown)
  - Hour of Day (15, 16, 17, 18)
- **File Name:** `radio_milwaukee_afternoon_drive_3pm_7pm.csv`

### Expected Columns:
- Date
- Hour of Day
- CUME
- TLH
- Active Sessions
- Device Family (if available)

---

### 14. **Evening Export** (7PM-12AM)
**Purpose:** Analyze evening entertainment and at-home listening

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - **Daypart: Evening (7PM-12AM)**
- **Dimensions:** 
  - Date (daily breakdown)
  - Hour of Day (19, 20, 21, 22, 23)
- **File Name:** `radio_milwaukee_evening_7pm_12am.csv`

### Expected Columns:
- Date
- Hour of Day
- CUME
- TLH
- Active Sessions
- Device Family (if available)

---

### 15. **Weekend Daytime Export** (Saturday-Sunday 6AM-7PM)
**Purpose:** Analyze weekend daytime listening patterns

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - **Daypart: Weekend Daytime (Sat-Sun 6AM-7PM)**
- **Dimensions:** 
  - Date (daily breakdown)
  - Day of Week (Saturday, Sunday)
  - Hour of Day
- **File Name:** `radio_milwaukee_weekend_daytime_6am_7pm.csv`

### Expected Columns:
- Date
- Day of Week
- Hour of Day
- CUME
- TLH
- Active Sessions

---

### 16. **Weekend Evening Export** (Saturday-Sunday 7PM-12AM)
**Purpose:** Analyze weekend evening entertainment listening

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - **Daypart: Weekend Evening (Sat-Sun 7PM-12AM)**
- **Dimensions:** 
  - Date (daily breakdown)
  - Day of Week (Saturday, Sunday)
  - Hour of Day
- **File Name:** `radio_milwaukee_weekend_evening_7pm_12am.csv`

### Expected Columns:
- Date
- Day of Week
- Hour of Day
- CUME
- TLH
- Active Sessions

---

### 17. **Overnight Export** (12AM-6AM)
**Purpose:** Analyze overnight and early morning streaming patterns

### Triton Webcast Explore Settings:
- **Filters:**
  - Publisher/Group/Station: Radio Milwaukee
  - Date Range: Last 18 Months
  - **Daypart: Overnight (12AM-6AM)**
- **Dimensions:** 
  - Date (daily breakdown)
  - Hour of Day (0, 1, 2, 3, 4, 5)
- **File Name:** `radio_milwaukee_overnight_12am_6am.csv`

### Expected Columns:
- Date
- Hour of Day
- CUME
- TLH
- Active Sessions
- Device Family (if available)

---

## Complete Export Checklist (Updated)

### Essential Exports (Phase 1):
1. ✅ Daily Overview Export
2. ✅ Daypart Performance Export (summary)
3. ✅ Device Analysis Export
4. ✅ Day of Week Export
5. ✅ Monthly Trends Export

### Detailed Daypart Exports (Phase 1 Enhanced):
6. ✅ Morning Drive Export (6AM-10AM)
7. ✅ Midday Export (10AM-3PM)
8. ✅ Afternoon Drive Export (3PM-7PM)
9. ✅ Evening Export (7PM-12AM)
10. ✅ Weekend Daytime Export (Sat-Sun 6AM-7PM)
11. ✅ Weekend Evening Export (Sat-Sun 7PM-12AM)
12. ✅ Overnight Export (12AM-6AM)

### Advanced Analysis Exports (Phase 1 Complete):
13. ✅ Hourly Patterns Export
14. ✅ Geographic Distribution Export
15. ✅ Stream Comparison Export
16. ✅ Daypart by Device Cross-Analysis Export
17. ✅ Weekend vs Weekday Export

### Total: 17 CSV Exports for Complete Analysis

## Daypart Export Strategy

### Priority Order for Implementation:

**Tier 1 (Critical):**
- Morning Drive (6AM-10AM)
- Afternoon Drive (3PM-7PM)
- Daily Overview

**Tier 2 (Important):**
- Midday (10AM-3PM)
- Evening (7PM-12AM)
- Weekend Daytime

**Tier 3 (Comprehensive):**
- Weekend Evening
- Overnight
- Advanced cross-analysis exports

This tiered approach allows you to start with the most critical dayparts for radio programming decisions, then expand to complete coverage as needed.

---

## Nielsen Demographics CSV Exports

### 18. **Nielsen Age Demographics Export**
**Purpose:** Analyze audience composition and performance by age groups

### Nielsen PD Advantage Web Settings:
- **Report Type:** Demographic Composition Report
- **Time Period:** Last 18 Months (monthly breakdown)
- **Demographics:** Age Groups (6-11, 12-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+)
- **Daypart:** Monday-Sunday 6AM-Midnight
- **Metrics:** AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- **File Name:** `radio_milwaukee_age_demographics_18months.csv`

### Expected Columns:
- Date/Month
- Age 6-11 AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Age 12-17 AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Age 18-24 AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Age 25-34 AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Age 35-44 AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Age 45-54 AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Age 55-64 AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Age 65+ AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %

---

### 19. **Nielsen Gender Demographics Export**
**Purpose:** Analyze audience composition and performance by gender

### Nielsen PD Advantage Web Settings:
- **Report Type:** Demographic Composition Report
- **Time Period:** Last 18 Months (monthly breakdown)
- **Demographics:** Gender (Male, Female)
- **Daypart:** Monday-Sunday 6AM-Midnight
- **Metrics:** AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- **File Name:** `radio_milwaukee_gender_demographics_18months.csv`

### Expected Columns:
- Date/Month
- Male AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Female AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Total Persons (for validation)

---

### 20. **Nielsen Ethnic Demographics Export**
**Purpose:** Analyze audience composition and performance by ethnicity

### Nielsen PD Advantage Web Settings:
- **Report Type:** Demographic Composition Report
- **Time Period:** Last 18 Months (monthly breakdown)
- **Demographics:** Ethnicity (White, Black/African American, Hispanic, Asian, Other)
- **Daypart:** Monday-Sunday 6AM-Midnight
- **Metrics:** AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- **File Name:** `radio_milwaukee_ethnic_demographics_18months.csv`

### Expected Columns:
- Date/Month
- White AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Black AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Hispanic AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Asian AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %
- Other AQH Persons, AQH Share, CUME Persons, CUME %, TSL, P1 %

---

### 21. **Nielsen Daypart Demographics Export**
**Purpose:** Analyze demographic performance across different dayparts

### Nielsen PD Advantage Web Settings:
- **Report Type:** Daypart Demographic Analysis
- **Time Period:** Last 18 Months (monthly breakdown)
- **Dayparts:** Morning Drive (6A-10A), Midday (10A-3P), Afternoon Drive (3P-7P), Evening (7P-12M)
- **Demographics:** Key age groups (18-24, 25-34, 35-44, 45-54, 55+) and gender
- **File Name:** `radio_milwaukee_daypart_demographics_18months.csv`

### Expected Columns:
- Date/Month
- Daypart
- Age 18-24 AQH Share, CUME %, TSL
- Age 25-34 AQH Share, CUME %, TSL
- Age 35-44 AQH Share, CUME %, TSL
- Age 45-54 AQH Share, CUME %, TSL
- Age 55+ AQH Share, CUME %, TSL
- Male AQH Share, CUME %, TSL
- Female AQH Share, CUME %, TSL

---

### 22. **Nielsen P1 Demographics Export**
**Purpose:** Analyze P1 (favorite station) listeners by demographics

### Nielsen PD Advantage Web Settings:
- **Report Type:** P1 Listener Analysis by Demographics
- **Time Period:** Last 18 Months (monthly breakdown)
- **Demographics:** All age groups, gender, and ethnicity
- **Metrics:** P1 AQH Persons, P1 CUME Persons, P1 Percentage, P1 TSL
- **File Name:** `radio_milwaukee_p1_demographics_18months.csv`

### Expected Columns:
- Date/Month
- Total P1 Listeners
- Age Group P1 Percentages (18-24, 25-34, 35-44, 45-54, 55+)
- Gender P1 Percentages (Male, Female)
- Ethnic P1 Percentages (White, Black, Hispanic, Asian, Other)
- P1 TSL by demographic segment

---

## Complete Export Checklist (Updated with Demographics)

### Essential Exports (Phase 1):
1. ✅ Daily Overview Export
2. ✅ Daypart Performance Export (summary)
3. ✅ Device Analysis Export
4. ✅ Day of Week Export
5. ✅ Monthly Trends Export

### Detailed Daypart Exports (Phase 1 Enhanced):
6. ✅ Morning Drive Export (6AM-10AM)
7. ✅ Midday Export (10AM-3PM)
8. ✅ Afternoon Drive Export (3PM-7PM)
9. ✅ Evening Export (7PM-12AM)
10. ✅ Weekend Daytime Export (Sat-Sun 6AM-7PM)
11. ✅ Weekend Evening Export (Sat-Sun 7PM-12AM)
12. ✅ Overnight Export (12AM-6AM)

### Advanced Analysis Exports (Phase 1 Complete):
13. ✅ Hourly Patterns Export
14. ✅ Geographic Distribution Export
15. ✅ Stream Comparison Export
16. ✅ Daypart by Device Cross-Analysis Export
17. ✅ Weekend vs Weekday Export

### Nielsen Demographics Exports (Phase 2 Enhanced):
18. ✅ Nielsen Age Demographics Export
19. ✅ Nielsen Gender Demographics Export
20. ✅ Nielsen Ethnic Demographics Export
21. ✅ Nielsen Daypart Demographics Export
22. ✅ Nielsen P1 Demographics Export

### Total: 22 CSV Exports for Complete Analysis

## Demographics Export Strategy

### Priority Order for Demographics Implementation:

**Tier 1 (Critical Demographics):**
- Age Demographics Export (18, 25-34, 35-44, 45-54, 55+)
- Gender Demographics Export (Male, Female)

**Tier 2 (Strategic Demographics):**
- Ethnic Demographics Export (market-specific)
- Daypart Demographics Export (cross-reference with streaming)

**Tier 3 (Advanced Demographics):**
- P1 Demographics Export (loyalty analysis)
- Combined demographic cross-analysis

## Strategic Applications for Demographics Data

### Programming Optimization
Use demographic performance data to:
- Schedule age-appropriate content during peak demographic listening periods
- Balance programming to serve both male and female audiences effectively
- Develop culturally relevant content for ethnic audience segments
- Optimize daypart programming for strongest demographic segments

### Advertiser Presentations
Leverage demographic data to:
- Demonstrate audience value for premium advertising rates
- Show demographic reach across both broadcast and streaming platforms
- Provide detailed audience profiles for targeted advertising campaigns
- Justify integrated cross-platform advertising packages

### Audience Development
Apply demographic insights to:
- Identify underserved demographic segments for growth opportunities
- Develop streaming content that appeals to strong broadcast demographics
- Create targeted promotional campaigns for specific demographic groups
- Optimize cross-platform audience migration strategies

### Competitive Analysis
Use demographic data for:
- Compare demographic composition with market competitors
- Identify demographic segments where Radio Milwaukee has competitive advantages
- Discover underserved demographic opportunities in the Milwaukee market
- Benchmark demographic performance against industry standards

This comprehensive demographic data collection enables Radio Milwaukee to make sophisticated, data-driven programming decisions that serve diverse audience segments while maximizing both broadcast and streaming performance across all demographic categories.

---

## Station Filtering Requirements for Radio Milwaukee

### Multi-Station Data Management

Radio Milwaukee operates multiple stations and streams that require separate analysis and comparison capabilities. Each CSV export must include proper station identification to enable filtering, comparison, and station-specific analysis.

### Required Station Identifiers in All Exports

**Station/Stream Column**: Every CSV export must include a "Station" or "Stream" column that clearly identifies which Radio Milwaukee property the data represents.

**Consistent Naming Convention**: Use standardized station identifiers across all exports to ensure proper data correlation and analysis.

**Example Station Identifiers:**
- WYMS-FM (88.9 The Bridge)
- WUWM-FM (89.7 NPR News)
- WYMS-HD2 (Alternative Stream)
- WUWM-HD2 (Classical Stream)
- Radio Milwaukee Online Stream
- Radio Milwaukee Mobile App Stream

### Station-Specific Export Strategy

**Individual Station Exports**: Generate separate CSV files for each station when detailed station-specific analysis is required.

**Combined Multi-Station Exports**: Include all stations in single CSV files with proper station identification columns for cross-station comparison.

**Station Filtering in Triton Webcast Explore**: Use Triton's station/stream filtering capabilities to generate both individual and combined exports as needed.

### Updated Export Specifications with Station Filtering

All 22 previously defined CSV exports should be generated with the following station management approaches:

**Approach 1: Station-Specific Files**
Generate separate CSV files for each Radio Milwaukee station:
- `radio_milwaukee_WYMS_daily_overview_18months.csv`
- `radio_milwaukee_WUWM_daily_overview_18months.csv`
- `radio_milwaukee_WYMS_HD2_daily_overview_18months.csv`

**Approach 2: Multi-Station Combined Files**
Generate combined CSV files with station identification columns:
- `radio_milwaukee_all_stations_daily_overview_18months.csv` (with Station column)
- `radio_milwaukee_all_stations_demographics_18months.csv` (with Station column)

**Recommended Implementation**: Use Approach 2 (combined files) for most exports to enable easy cross-station analysis while maintaining the ability to filter by individual stations within the Taipy/Next.js application.

### Station Management in Analytics Application

**Station Selection Interface**: The application should provide intuitive station selection and filtering controls that allow users to analyze individual stations or compare across the Radio Milwaukee portfolio.

**Cross-Station Analysis**: Enable side-by-side comparison of performance metrics across different Radio Milwaukee stations with proper context and strategic insights.

**Station-Specific Dashboards**: Provide dedicated dashboard views for each station while maintaining the ability to switch between stations and view portfolio-wide performance.

**AI Station Awareness**: The CopilotKit AI integration should understand station context and provide station-specific insights and recommendations based on format, target audience, and strategic objectives.

### Strategic Applications for Multi-Station Analysis

**Portfolio Performance**: Analyze overall Radio Milwaukee performance across all stations while identifying individual station strengths and opportunities.

**Format Comparison**: Compare performance between different station formats (NPR news vs music) to understand audience preferences and optimize programming strategies.

**Resource Allocation**: Use cross-station performance data to inform resource allocation, programming investments, and strategic planning decisions.

**Competitive Positioning**: Understand how different Radio Milwaukee stations perform against market competitors in their respective formats and demographics.

**Audience Development**: Identify opportunities for cross-promotion between stations and develop strategies for growing audience across the entire Radio Milwaukee portfolio.

This multi-station approach ensures that Radio Milwaukee can analyze both individual station performance and portfolio-wide strategic opportunities while maintaining the flexibility to focus on specific stations when detailed analysis is required.
