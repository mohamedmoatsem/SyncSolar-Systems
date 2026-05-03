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
}

export function MetricCard({ label, value, unit, icon, iconColor, subtitle }: MetricCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.iconWrap, { backgroundColor: (iconColor ?? colors.primary) + "22" }]}>
        <Feather name={icon} size={18} color={iconColor ?? colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unit}</Text> : null}
      </View>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    gap: 6,
    minWidth: 140,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontSize: 12,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
