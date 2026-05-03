import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  subtitle?: string;
  trend?: "up" | "down";
  progressValue?: number;
  progressColor?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  iconColor,
  subtitle,
  trend,
  progressValue,
  progressColor,
}: MetricCardProps) {
  const colors = useColors();
  const ic = iconColor ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 10 },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconWrap, { backgroundColor: ic + "22" }]}>
          <Feather name={icon} size={16} color={ic} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend === "up" ? colors.success + "22" : colors.destructive + "22" }]}>
            <Feather
              name={trend === "up" ? "trending-up" : "trending-down"}
              size={10}
              color={trend === "up" ? colors.success : colors.destructive}
            />
          </View>
        )}
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1}>
          {value}
        </Text>
        {unit ? (
          <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unit}</Text>
        ) : null}
      </View>
      {progressValue !== undefined && progressColor && (
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(0, progressValue))}%` as any,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      )}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    gap: 5,
    minWidth: 130,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    flexWrap: "wrap",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontSize: 11,
    fontWeight: "500",
  },
  progressBg: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
});
