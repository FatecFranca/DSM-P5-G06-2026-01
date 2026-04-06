import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '../../theme';
import { GlucoseReading } from '../../types';
import { getGlucoseStatusColor } from '../../utils/helpers';

interface Props {
  data: GlucoseReading[];
  height?: number;
  showDots?: boolean;
  compact?: boolean;
}

const W = Dimensions.get('window').width - 48;

export const GlucoseChart = ({ data, height = 160, showDots = true, compact = false }: Props) => {
  const chartData = [...data].reverse().slice(-7);
  if (chartData.length < 2) return null;

  const values = chartData.map(d => d.value);
  const maxVal = Math.max(...values, 180);
  const minVal = Math.min(...values, 60);
  const range = maxVal - minVal || 1;

  const padX = compact ? 8 : 20;
  const padY = compact ? 8 : 16;
  const chartW = W - padX * 2;
  const chartH = height - padY * 2;

  const getX = (i: number) => padX + (i / (chartData.length - 1)) * chartW;
  const getY = (v: number) => padY + chartH - ((v - minVal) / range) * chartH;

  // Build path
  let pathD = '';
  let areaD = '';
  chartData.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.value);
    if (i === 0) {
      pathD += `M ${x} ${y}`;
      areaD += `M ${x} ${padY + chartH} L ${x} ${y}`;
    } else {
      const prevX = getX(i - 1);
      const prevY = getY(chartData[i - 1].value);
      const cx1 = (prevX + x) / 2;
      pathD += ` C ${cx1} ${prevY} ${cx1} ${y} ${x} ${y}`;
      areaD += ` C ${cx1} ${prevY} ${cx1} ${y} ${x} ${y}`;
    }
  });
  areaD += ` L ${getX(chartData.length - 1)} ${padY + chartH} Z`;

  // Normal range lines
  const normalMaxY = getY(140);
  const normalMinY = getY(70);

  return (
    <View>
      <Svg width={W} height={height}>
        <Defs>
          <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.3" />
            <Stop offset="1" stopColor={Colors.primary} stopOpacity="0.02" />
          </SvgLinearGradient>
        </Defs>

        {/* Normal range band */}
        <Rect
          x={padX} y={normalMaxY}
          width={chartW} height={normalMinY - normalMaxY}
          fill={Colors.primary} opacity={0.06}
        />

        {/* Grid lines */}
        {[70, 110, 140, 180].map(v => {
          const y = getY(v);
          if (y < padY || y > padY + chartH) return null;
          return (
            <React.Fragment key={v}>
              <Line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke={Colors.border} strokeWidth={1} strokeDasharray="4,3" />
              {!compact && (
                <SvgText x={2} y={y + 4} fontSize={9} fill={Colors.textLight}>{v}</SvgText>
              )}
            </React.Fragment>
          );
        })}

        {/* Area */}
        <Path d={areaD} fill="url(#areaGrad)" />

        {/* Line */}
        <Path d={pathD} stroke={Colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {showDots && chartData.map((d, i) => {
          const color = getGlucoseStatusColor(d.status);
          return (
            <React.Fragment key={d.id}>
              <Circle cx={getX(i)} cy={getY(d.value)} r={5} fill={Colors.card} stroke={color} strokeWidth={2} />
              {!compact && (
                <SvgText
                  x={getX(i)} y={getY(d.value) - 9}
                  fontSize={10} fill={color} fontWeight="700"
                  textAnchor="middle"
                >
                  {d.value}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* X labels */}
      {!compact && (
        <View style={[styles.xLabels, { paddingHorizontal: padX }]}>
          {chartData.map((d, i) => (
            <Text key={d.id} style={styles.xLabel} numberOfLines={1}>
              {d.date.slice(5).replace('-', '/')}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  xLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
});
