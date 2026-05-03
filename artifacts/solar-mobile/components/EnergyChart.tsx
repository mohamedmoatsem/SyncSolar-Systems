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

  const displayData = data.filter((_, i) => i % 3 === 0);
  const maxVal = Math.max(...displayData.map((d) => Math.max(d.production, d.consumption)), 1);

  const totalProd = data.reduce((s, d) => s + d.production, 0);
  const totalCons = data.reduce((s, d) => s + d.consumption, 0);
  const efficiency = totalProd > 0 ? Math.round((totalCons / totalProd) * 100) : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 10 },
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {efficiency > 0 && (
          <View style={[styles.effBadge, { backgroundColor: colors.success + "22" }]}>
            <Text style={[styles.effText, { color: colors.success }]}>{efficiency}%</Text>
          </View>
        )}
      </View>

      <View style={styles.chart}>
        {displayData.map((point, i) => {
          const prodH = Math.max((point.production / maxVal) * 110, point.production > 0 ? 2 : 0);
          const consH = Math.max((point.consumption / maxVal) * 110, point.consumption > 0 ? 2 : 0);
          const isPeak = point.production === Math.max(...displayData.map((d) => d.production));
          return (
            <View key={i} style={styles.barGroup}>
              <View style={styles.bars}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: prodH,
                      backgroundColor: isPeak ? colors.primary : colors.primary + "bb",
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      height: consH,
                      backgroundColor: colors.secondary + "bb",
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.hourLabel, { color: colors.mutedForeground }]}>
                {point.hour.slice(0, 2)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footer}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{productionLabel}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{consumptionLabel}</Text>
          </View>
        </View>
        <View style={styles.totals}>
          <Text style={[styles.totalVal, { color: colors.primary }]}>
            {Math.round(totalProd / 1000)}
            <Text style={[styles.totalUnit, { color: colors.mutedForeground }]}> kW</Text>
          </Text>
          <Text style={[styles.totalSep, { color: colors.border }]}>/</Text>
          <Text style={[styles.totalVal, { color: colors.secondary }]}>
            {Math.round(totalCons / 1000)}
            <Text style={[styles.totalUnit, { color: colors.mutedForeground }]}> kW</Text>
          </Text>
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
    marginTop: 10,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 13, fontWeight: "600" },
  effBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  effText: { fontSize: 11, fontWeight: "700" },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: 2,
    marginBottom: 8,
  },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
    width: "100%",
    justifyContent: "center",
  },
  bar: { width: 6, minHeight: 2 },
  hourLabel: { fontSize: 9, textAlign: "center" },
  divider: { height: 1, marginVertical: 10 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legend: { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: "500" },
  totals: { flexDirection: "row", alignItems: "center", gap: 4 },
  totalVal: { fontSize: 13, fontWeight: "700" },
  totalUnit: { fontSize: 10 },
  totalSep: { fontSize: 13 },
});
