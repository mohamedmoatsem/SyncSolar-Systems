import React from "react";
import {
  ActivityIndicator,
  Image,
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
import { CachedBadge } from "@/components/CachedBadge";
import { EnergyChart } from "@/components/EnergyChart";
import { LangToggle } from "@/components/LangToggle";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { apiFetch } from "@/hooks/useApi";

const APP_ICON = require("@/assets/images/icon.png");

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
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isOnline = useNetworkStatus();
  const topPad = Platform.OS === "web" ? 67 : 0;

  const {
    data: summary,
    isLoading,
    refetch,
    isRefetching,
    isError,
    dataUpdatedAt,
  } = useQuery<Summary>({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch("/api/dashboard/summary"),
    refetchInterval: 10000,
  });

  const { data: energy, dataUpdatedAt: energyUpdatedAt } = useQuery<HourPoint[]>({
    queryKey: ["energy-today"],
    queryFn: () => apiFetch("/api/dashboard/energy-today"),
    refetchInterval: 60000,
  });

  const statusLabel =
    summary?.systemStatus === "normal" ? t.normal
    : summary?.systemStatus === "warning" ? t.warning
    : summary?.systemStatus === "fault" ? t.fault
    : summary ? t.offline : "-";

  const batteryPct = summary?.batteryLevel ?? 0;
  const batteryColor =
    batteryPct >= 60 ? colors.success
    : batteryPct >= 30 ? colors.warning
    : colors.destructive;

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
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Image source={APP_ICON} style={styles.logoImg} resizeMode="contain" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
              Sync Solar System
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]} numberOfLines={1}>
              {isOnline ? t.liveData : t.offlineMode}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {summary && <StatusBadge status={summary.systemStatus} label={statusLabel} />}
          <CachedBadge dataUpdatedAt={dataUpdatedAt} />
          <LangToggle />
        </View>
      </View>

      {isLoading && !summary ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>{t.loading}</Text>
        </View>
      ) : isError && !summary ? (
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
      ) : summary ? (
        <>
          <View style={styles.section}>
            <View style={styles.grid}>
              <MetricCard
                label={t.currentPower}
                value={Math.round(summary.currentPower)}
                unit="W"
                icon="zap"
                iconColor={colors.primary}
                trend={summary.currentPower > 1000 ? "up" : undefined}
              />
              <MetricCard
                label={t.batteryLevel}
                value={Math.round(summary.batteryLevel)}
                unit="%"
                icon="battery-charging"
                iconColor={batteryColor}
                progressValue={batteryPct}
                progressColor={batteryColor}
              />
            </View>
            <View style={styles.grid}>
              <MetricCard
                label={t.energyToday}
                value={summary.energyToday.toFixed(1)}
                unit="kWh"
                icon="sun"
                iconColor={colors.chart1}
              />
              <MetricCard
                label={t.savingsToday}
                value={`$${summary.savingsToday.toFixed(2)}`}
                icon="dollar-sign"
                iconColor={colors.success}
              />
            </View>
            <View style={styles.grid}>
              <MetricCard
                label={t.co2Saved}
                value={summary.co2Saved.toFixed(1)}
                unit="kg"
                icon="wind"
                iconColor={colors.secondary}
              />
              <MetricCard
                label={t.activeAlerts}
                value={summary.activeAlerts}
                icon="bell"
                iconColor={summary.activeAlerts > 0 ? colors.destructive : colors.mutedForeground}
              />
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Feather name="cpu" size={15} color={colors.secondary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{t.devicesOnline}</Text>
              <View style={{ flex: 1 }} />
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {summary.devicesOnline}
                <Text style={{ color: colors.mutedForeground }}>/{summary.totalDevices}</Text>
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Feather name="database" size={15} color={colors.secondary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{t.energyTotal}</Text>
              <View style={{ flex: 1 }} />
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {summary.energyTotal.toFixed(1)}
                <Text style={{ color: colors.mutedForeground }}> kWh</Text>
              </Text>
            </View>
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
    paddingBottom: 12,
    paddingTop: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 },
  logoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    flexShrink: 0,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.3, flexShrink: 1 },
  headerSub: { fontSize: 10, fontWeight: "500", marginTop: 1 },
  section: { paddingTop: 4 },
  grid: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 13, fontWeight: "500" },
  infoValue: { fontSize: 15, fontWeight: "700" },
  divider: { height: 1, marginHorizontal: 14 },
  center: { alignItems: "center", marginTop: 80, gap: 14 },
  loadingText: { fontSize: 13 },
  errorText: { fontSize: 14, fontWeight: "500" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  retryTxt: { fontSize: 13, fontWeight: "600" },
});
