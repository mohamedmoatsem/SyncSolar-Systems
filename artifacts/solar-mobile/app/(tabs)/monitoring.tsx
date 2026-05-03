import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/hooks/useApi";

interface Reading {
  id: number;
  voltage: number;
  current: number;
  power: number;
  batteryLevel: number;
  batteryVoltage: number;
  temperature: number;
  irradiance: number;
  loadPower: number;
  systemStatus: string;
  timestamp: string;
}

function ReadingRow({ icon, label, value, unit, color }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; unit: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, { backgroundColor: color + "22" }]}>
          <Feather name={icon} size={14} color={color} />
        </View>
        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.rowUnit, { color: colors.mutedForeground }]}>{unit}</Text>
      </View>
    </View>
  );
}

export default function MonitoringScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBotPad = Platform.OS === "web" ? 34 : 0;

  const { data, isLoading, refetch, isError, dataUpdatedAt } = useQuery<Reading>({
    queryKey: ["readings-latest"],
    queryFn: () => apiFetch("/api/readings/latest"),
    refetchInterval: 5000,
  });

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 + webBotPad, paddingTop: webTopPad }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.monitoring}</Text>
        {updatedAt && (
          <Text style={[styles.updatedAt, { color: colors.mutedForeground }]}>
            {t.lastUpdated}: {updatedAt}
          </Text>
        )}
      </View>

      {isLoading && !data ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: colors.destructive }}>{t.errorLoad}</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={{ color: colors.primary, marginTop: 8 }}>{t.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ReadingRow icon="zap" label={t.voltage} value={data.voltage.toFixed(1)} unit="V" color={colors.primary} />
          <ReadingRow icon="activity" label={t.current} value={data.current.toFixed(2)} unit="A" color={colors.secondary} />
          <ReadingRow icon="sun" label={t.power} value={Math.round(data.power).toString()} unit="W" color={colors.primary} />
          <ReadingRow icon="battery-charging" label={t.batteryLevel} value={data.batteryLevel.toFixed(1)} unit="%" color={colors.success} />
          <ReadingRow icon="battery" label={t.batteryVoltage} value={data.batteryVoltage.toFixed(1)} unit="V" color={colors.success} />
          <ReadingRow icon="thermometer" label={t.temperature} value={data.temperature.toFixed(1)} unit="°C" color={colors.warning} />
          <ReadingRow icon="sun" label={t.irradiance} value={Math.round(data.irradiance).toString()} unit="W/m²" color={colors.chart1} />
          <ReadingRow icon="crosshair" label={t.loadPower} value={Math.round(data.loadPower).toString()} unit="W" color={colors.chart2} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  updatedAt: { fontSize: 11 },
  card: {
    margin: 16,
    borderWidth: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowIcon: { width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 13, fontWeight: "500" },
  rowRight: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  rowValue: { fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  rowUnit: { fontSize: 11 },
  center: { alignItems: "center", marginTop: 60 },
});
