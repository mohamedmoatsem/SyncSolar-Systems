import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Status = "normal" | "warning" | "fault" | "offline" | "active" | "resolved" | "critical" | "info" | "on" | "off";

interface Props {
  status: Status | string;
  label: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: Props) {
  const colors = useColors();

  const colorMap: Record<string, string> = {
    normal: colors.success,
    on: colors.success,
    active: colors.primary,
    resolved: colors.mutedForeground,
    warning: colors.warning,
    critical: colors.destructive,
    fault: colors.destructive,
    offline: colors.mutedForeground,
    off: colors.mutedForeground,
    info: colors.secondary,
  };

  const dotColor = colorMap[status] ?? colors.mutedForeground;

  return (
    <View style={[styles.badge, { backgroundColor: dotColor + "22", borderRadius: 20 }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.text, { color: dotColor, fontSize: size === "sm" ? 10 : 12 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
