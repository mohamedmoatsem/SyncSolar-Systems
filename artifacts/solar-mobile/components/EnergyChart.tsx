import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface HourPoint {
  hour: string;
  production: number;
  consumption: number;
}

interface Props {
  data: HourPoint[];
  title: string;
  productionLabel: string;
  consumptionLabel: string;
}

export function EnergyChart({ data, title, productionLabel, consumptionLabel }: Props) {
  const colors = useColors();

  const maxVal = Math.max(...data.map((d) => Math.max(d.production, d.consumption)), 1);

  const visibleHours = [0, 3, 6, 9, 12, 15, 18, 21];
  const displayData = data.filter((_, i) => i % 3 === 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <View style={styles.chart}>
        {displayData.map((point, i) => {
          const prodH = Math.max((point.production / maxVal) * 100, 0);
          const consH = Math.max((point.consumption / maxVal) * 100, 0);
          return (
            <View key={i} style={styles.barGroup}>
              <View style={styles.bars}>
                <View style={[styles.bar, { height: prodH, backgroundColor: colors.chart1, borderRadius: 2 }]} />
                <View style={[styles.bar, { height: consH, backgroundColor: colors.chart2, borderRadius: 2 }]} />
              </View>
              <Text style={[styles.hourLabel, { color: colors.mutedForeground }]}>
                {point.hour.slice(0, 2)}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.chart1 }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{productionLabel}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.chart2 }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{consumptionLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    gap: 2,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
    width: "100%",
    justifyContent: "center",
  },
  bar: {
    width: 5,
    minHeight: 2,
  },
  hourLabel: {
    fontSize: 9,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
