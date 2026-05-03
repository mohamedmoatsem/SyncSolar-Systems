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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { CachedBadge } from "@/components/CachedBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
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

interface RowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  unit: string;
  color: string;
  progress?: number;
}

function ReadingRow({ icon, label, value, unit, color, progress }: RowProps) {
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
        {progress !== undefined && (
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, progress)}%` as any, backgroundColor: color },
              ]}
            />
          </View>
        )}
        <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.rowUnit, { color: colors.mutedForeground }]}>{unit}</Text>
      </View>
    </View>
  );
}

export default function MonitoringScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isOnline = useNetworkStatus();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch, isRefetching, isError, dataUpdatedAt } = useQuery<Reading>({
    queryKey: ["readings-latest"],
    queryFn: () => apiFetch("/api/readings/latest"),
    refetchInterval: 5000,
  });

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      })
    : null;

  const statusLabel =
    data?.systemStatus === "normal" ? t.normal
    : data?.systemStatus === "warning" ? t.warning
    : data?.systemStatus === "fault" ? t.fault
    : t.offline;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 110 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isLoading}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPad }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.monitoring}</Text>
          {updatedAt && (
            <View style={styles.liveRow}>
              <View style={[styles.liveDot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
              <Text style={[styles.updatedAt, { color: colors.mutedForeground }]}>
                {t.lastUpdated}: {updatedAt}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <CachedBadge dataUpdatedAt={dataUpdatedAt} />
          {data && <StatusBadge status={data.systemStatus} label={statusLabel} size="sm" />}
          <LangToggle />
        </View>
      </View>

      {isLoading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>{t.loading}</Text>
        </View>
      ) : isError && !data ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={40} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>{t.errorLoad}</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Feather name="refresh-cw" size={14} color={colors.primary} />
            <Text style={[styles.retryTxt, { color: colors.primary }]}>{t.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ReadingRow icon="zap" label={t.voltage} value={data.voltage.toFixed(1)} unit="V" color={colors.primary} progress={(data.voltage / 60) * 100} />
          <ReadingRow icon="activity" label={t.current} value={data.current.toFixed(2)} unit="A" color={colors.secondary} progress={(data.current / 30) * 100} />
          <ReadingRow icon="sun" label={t.power} value={Math.round(data.power).toString()} unit="W" color={colors.primary} progress={(data.power / 5000) * 100} />
          <ReadingRow
            icon="battery-charging" label={t.batteryLevel} value={data.batteryLevel.toFixed(1)} unit="%"
            color={data.batteryLevel >= 60 ? colors.success : data.batteryLevel >= 30 ? colors.warning : colors.destructive}
            progress={data.batteryLevel}
          />
          <ReadingRow icon="battery" label={t.batteryVoltage} value={data.batteryVoltage.toFixed(1)} unit="V" color={colors.success} progress={(data.batteryVoltage / 60) * 100} />
          <ReadingRow
            icon="thermometer" label={t.temperature} value={data.temperature.toFixed(1)} unit="°C"
            color={data.temperature > 50 ? colors.destructive : data.temperature > 35 ? colors.warning : colors.secondary}
            progress={(data.temperature / 80) * 100}
          />
          <ReadingRow icon="sun" label={t.irradiance} value={Math.round(data.irradiance).toString()} unit="W/m²" color={colors.chart1} progress={(data.irradiance / 1200) * 100} />
          <ReadingRow icon="crosshair" label={t.loadPower} value={Math.round(data.loadPower).toString()} unit="W" color={colors.chart2} progress={(data.loadPower / 5000) * 100} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  updatedAt: { fontSize: 11 },
  card: { margin: 16, borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 8,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 13, fontWeight: "500" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  progressBar: { width: 40, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  rowValue: { fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  rowUnit: { fontSize: 11, minWidth: 28 },
  center: { alignItems: "center", marginTop: 80, gap: 14 },
  loadingText: { fontSize: 13 },
  errorText: { fontSize: 14, fontWeight: "500" },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
  retryTxt: { fontSize: 13, fontWeight: "600" },
});
