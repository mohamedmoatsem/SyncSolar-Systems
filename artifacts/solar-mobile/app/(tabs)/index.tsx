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

import { EnergyChart } from "@/components/EnergyChart";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/hooks/useApi";

interface Summary {
  currentPower: number;
  energyToday: number;
  energyTotal: number;
  batteryLevel: number;
  systemStatus: string;
  activeAlerts: number;
  devicesOnline: number;
  totalDevices: number;
  savingsToday: number;
  co2Saved: number;
}

interface HourPoint { hour: string; production: number; consumption: number; }

export default function DashboardScreen() {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBotPad = Platform.OS === "web" ? 34 : 0;

  const { data: summary, isLoading, refetch, isError } = useQuery<Summary>({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch("/api/dashboard/summary"),
    refetchInterval: 10000,
  });

  const { data: energy } = useQuery<HourPoint[]>({
    queryKey: ["energy-today"],
    queryFn: () => apiFetch("/api/dashboard/energy-today"),
    refetchInterval: 60000,
  });

  const statusLabel = summary
    ? summary.systemStatus === "normal" ? t.normal
    : summary.systemStatus === "warning" ? t.warning
    : summary.systemStatus === "fault" ? t.fault
    : t.offline
    : "-";

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 + webBotPad, paddingTop: webTopPad }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Solar SCADA</Text>
        {summary && (
          <StatusBadge status={summary.systemStatus} label={statusLabel} />
        )}
      </View>

      {isLoading && !summary ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: colors.destructive }}>{t.errorLoad}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={{ color: colors.primary }}>{t.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            <MetricCard
              label={t.currentPower}
              value={summary ? Math.round(summary.currentPower) : 0}
              unit="W"
              icon="zap"
              iconColor={colors.primary}
            />
            <MetricCard
              label={t.batteryLevel}
              value={summary ? Math.round(summary.batteryLevel) : 0}
              unit="%"
              icon="battery-charging"
              iconColor={summary && summary.batteryLevel < 20 ? colors.destructive : colors.success}
            />
          </View>
          <View style={styles.grid}>
            <MetricCard
              label={t.energyToday}
              value={summary ? summary.energyToday : 0}
              unit="kWh"
              icon="sun"
              iconColor={colors.primary}
            />
            <MetricCard
              label={t.activeAlerts}
              value={summary ? summary.activeAlerts : 0}
              icon="bell"
              iconColor={summary && summary.activeAlerts > 0 ? colors.destructive : colors.mutedForeground}
            />
          </View>
          <View style={styles.grid}>
            <MetricCard
              label={t.savingsToday}
              value={summary ? `$${summary.savingsToday}` : "$0"}
              icon="dollar-sign"
              iconColor={colors.success}
            />
            <MetricCard
              label={t.co2Saved}
              value={summary ? `${summary.co2Saved}` : "0"}
              unit="kg"
              icon="wind"
              iconColor={colors.secondary}
            />
          </View>
          <View style={[styles.devicesRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="cpu" size={16} color={colors.secondary} />
            <Text style={[styles.devicesText, { color: colors.foreground }]}>
              {summary?.devicesOnline ?? 0}/{summary?.totalDevices ?? 0} {t.devicesOnline}
            </Text>
          </View>

          {energy && energy.length > 0 && (
            <EnergyChart
              data={energy}
              title={t.energyChart}
              productionLabel={t.production}
              consumptionLabel={t.consumption}
            />
          )}
        </>
      )}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },
  devicesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  devicesText: { fontSize: 13, fontWeight: "500" },
  center: { alignItems: "center", marginTop: 60, gap: 12 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8 },
});
