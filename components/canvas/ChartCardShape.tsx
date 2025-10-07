import {
  BaseBoxShapeUtil,
  HTMLContainer,
  TLBaseShape,
  T,
  Rectangle2d,
} from 'tldraw';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

// Define the chart card shape type
export type ChartCardShape = TLBaseShape<
  'chartCard',
  {
    w: number;
    h: number;
    chartType: 'line' | 'bar' | 'pie' | 'table';
    title: string;
    data: any[];
    xAxis?: string;
    yAxis?: string;
    description?: string;
  }
>;

// Create the shape util
export class ChartCardShapeUtil extends BaseBoxShapeUtil<ChartCardShape> {
  static override type = 'chartCard' as const;

  static override props = {
    w: T.number,
    h: T.number,
    chartType: T.string,
    title: T.string,
    data: T.any,
    xAxis: T.string,
    yAxis: T.string,
    description: T.string,
  };

  getDefaultProps(): ChartCardShape['props'] {
    return {
      w: 400,
      h: 300,
      chartType: 'bar',
      title: 'Chart Title',
      data: [],
      xAxis: 'x',
      yAxis: 'y',
      description: '',
    };
  }

  override getGeometry(shape: ChartCardShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  renderChart(shape: ChartCardShape) {
    const { data, chartType, xAxis, yAxis } = shape.props;

    if (!data || data.length === 0) {
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: '14px',
          }}
        >
          No data available
        </div>
      );
    }

    const commonProps = {
      margin: { top: 20, right: 30, bottom: 50, left: 60 },
      theme: {
        fontSize: 12,
        textColor: '#374151',
        grid: {
          line: {
            stroke: '#e5e7eb',
            strokeWidth: 1,
          },
        },
        axis: {
          domain: {
            line: {
              stroke: '#d1d5db',
              strokeWidth: 1,
            },
          },
          ticks: {
            line: {
              stroke: '#d1d5db',
              strokeWidth: 1,
            },
            text: {
              fontSize: 11,
              fill: '#6b7280',
            },
          },
          legend: {
            text: {
              fontSize: 12,
              fill: '#374151',
              fontWeight: 500,
            },
          },
        },
      },
    };

    try {
      switch (chartType) {
        case 'bar':
          return (
            <ResponsiveBar
              data={data}
              keys={[yAxis || 'value']}
              indexBy={xAxis || 'label'}
              colors={{ scheme: 'set2' }}
              axisBottom={{
                tickRotation: -45,
                legend: xAxis,
                legendPosition: 'middle',
                legendOffset: 40,
              }}
              axisLeft={{
                legend: yAxis,
                legendPosition: 'middle',
                legendOffset: -50,
              }}
              {...commonProps}
            />
          );

        case 'line':
          // Transform data for line chart
          const lineData = [{
            id: yAxis || 'series',
            data: data.map((d: any) => ({
              x: d[xAxis || 'x'],
              y: d[yAxis || 'y'],
            })),
          }];
          return (
            <ResponsiveLine
              data={lineData}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              axisBottom={{
                tickRotation: -45,
                legend: xAxis,
                legendPosition: 'middle',
                legendOffset: 40,
              }}
              axisLeft={{
                legend: yAxis,
                legendPosition: 'middle',
                legendOffset: -50,
              }}
              enablePoints={true}
              pointSize={8}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              useMesh={true}
              {...commonProps}
            />
          );

        case 'pie':
          const pieData = data.map((d: any) => ({
            id: d[xAxis || 'label'],
            label: d[xAxis || 'label'],
            value: d[yAxis || 'value'],
          }));
          return (
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'set2' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsTextColor="#374151"
              arcLinkLabelsThickness={2}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            />
          );

        case 'table':
          return (
            <div style={{ height: '100%', overflowY: 'auto', fontSize: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(data[0] || {}).map((key) => (
                      <th
                        key={key}
                        style={{
                          textAlign: 'left',
                          padding: '8px',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: 600,
                          color: '#374151',
                        }}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row: any, idx: number) => (
                    <tr key={idx}>
                      {Object.values(row).map((val: any, cellIdx: number) => (
                        <td
                          key={cellIdx}
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#6b7280',
                          }}
                        >
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        default:
          return <div>Unsupported chart type: {chartType}</div>;
      }
    } catch (error) {
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          Error rendering chart
        </div>
      );
    }
  }

  override component(shape: ChartCardShape) {
    return (
      <HTMLContainer
        style={{
          pointerEvents: 'all',
          width: shape.props.w,
          height: shape.props.h,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Card Header */}
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111' }}>
              {shape.props.title}
            </h3>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {shape.props.chartType} chart
            </div>
          </div>

          {/* Chart Area */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {this.renderChart(shape)}
          </div>
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: ChartCardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
