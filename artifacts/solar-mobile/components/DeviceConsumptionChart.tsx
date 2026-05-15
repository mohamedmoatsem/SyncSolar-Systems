import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/hooks/useApi";

interface DeviceSummary {
  deviceName: string;
  currentWatts: number;
  totalKwh: number;
  lastSeen: string;
  share: number;
}

interface ConsumptionSummary {
  systemId: number;
  totalWatts: number;
  devices: DeviceSummary[];
}

const DEVICE_COLORS = [
  "#ff8c1a",
  "#00c8d8",
  "#a855f7",
  "#22c55e",
  "#f59e0b",
  "#f23030",
  "#3b82f6",
  "#ec4899",
];

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}ث`;
  if (diff < 3600) return `${Math.floor(diff / 60)}د`;
  return `${Math.floor(diff / 3600)}س`;
}

export function DeviceConsumptionChart() {
  const colors = useColors();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery<ConsumptionSummary>({
    queryKey: ["device-consumption-summary"],
    queryFn: () => apiFetch("/api/device-consumption/summary"),
    refetchInterval: 10_000,
    staleTime: 8_000,
  });

  const hasData = data && data.devices.length > 0;
  const maxWatts = data
    ? Math.max(...data.devices.map((d) => d.currentWatts), 1)
    : 1;

  const updatedStr = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <Pressable style={s.header} onPress={() => setExpanded((v) => !v)}>
        <View style={s.headerLeft}>
          <View style={[s.iconWrap, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="activity" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={[s.title, { color: colors.foreground }]}>{t.deviceConsumption}</Text>
            {data && (
              <Text style={[s.sub, { color: colors.mutedForeground }]}>
                {t.totalSystemLoad}: {data.totalWatts.toLocaleString()} W
              </Text>
            )}
          </View>
        </View>
        <View style={s.headerRight}>
          {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
          {!isLoading && (
            <Pressable onPress={() => refetch()} style={s.refreshBtn}>
              <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}
          <View style={[s.liveDot, { backgroundColor: hasData ? colors.success : colors.muted }]} />
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        </View>
      </Pressable>

      {expanded && (
        <>
          <View style={[s.divider, { backgroundColor: colors.border }]} />

          {isLoading ? (
            <View style={s.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : isError ? (
            <View style={s.center}>
              <Feather name="wifi-off" size={28} color={colors.destructive} />
              <Text style={[s.emptyText, { color: colors.destructive }]}>{t.errorLoad}</Text>
            </View>
          ) : !hasData ? (
            <View style={s.emptyWrap}>
              <Feather name="radio" size={32} color={colors.mutedForeground} />
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>{t.noConsumptionData}</Text>
              <View style={[s.hintBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="code" size={12} color={colors.primary} />
                <Text style={[s.hintText, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {t.iotEndpointHint}
                </Text>
              </View>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {/* Column labels */}
              <View style={s.colLabels}>
                <Text style={[s.colLabel, { color: colors.mutedForeground, flex: 3, textAlign: "right" }]}>
                  الجهاز
                </Text>
                <Text style={[s.colLabel, { color: colors.mutedForeground, flex: 5 }]}>
                  {t.currentWatts}
                </Text>
                <Text style={[s.colLabel, { color: colors.mutedForeground, flex: 2, textAlign: "right" }]}>
                  {t.totalKwhLabel}
                </Text>
              </View>

              {data!.devices.map((device, i) => {
                const color = DEVICE_COLORS[i % DEVICE_COLORS.length];
                const barW = (device.currentWatts / maxWatts) * 100;

                return (
                  <View key={device.deviceName} style={s.deviceRow}>
                    {/* Device name */}
                    <View style={{ flex: 3, alignItems: "flex-end", paddingRight: 8 }}>
                      <Text
                        style={[s.deviceName, { color: colors.foreground }]}
                        numberOfLines={2}
                      >
                        {device.deviceName}
                      </Text>
                      <Text style={[s.deviceSub, { color: colors.mutedForeground }]}>
                        {device.share}%
                      </Text>
                    </View>

                    {/* Bar + watt value */}
                    <View style={[s.barWrap, { flex: 5 }]}>
                      <View style={s.barTrack}>
                        <View
                          style={[
                            s.barFill,
                            {
                              width: `${Math.max(barW, 2)}%` as any,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                      <View style={s.wattRow}>
                        <Text style={[s.wattVal, { color }]}>
                          {device.currentWatts >= 1000
                            ? `${(device.currentWatts / 1000).toFixed(1)} kW`
                            : `${device.currentWatts} W`}
                        </Text>
                        <Text style={[s.agoText, { color: colors.mutedForeground }]}>
                          {timeAgo(device.lastSeen)}
                        </Text>
                      </View>
                    </View>

                    {/* Total kWh */}
                    <View style={{ flex: 2, alignItems: "flex-end" }}>
                      <Text style={[s.kwhVal, { color: colors.foreground }]}>
                        {device.totalKwh >= 1000
                          ? `${(device.totalKwh / 1000).toFixed(1)}M`
                          : device.totalKwh.toFixed(1)}
                      </Text>
                      <Text style={[s.kwhUnit, { color: colors.mutedForeground }]}>kWh</Text>
                    </View>
                  </View>
                );
              })}

              {/* Total footer */}
              <View style={[s.totalFooter, { borderColor: colors.border }]}>
                <Text style={[s.totalLabel, { color: colors.mutedForeground }]}>{t.totalSystemLoad}</Text>
                <Text style={[s.totalVal, { color: colors.primary }]}>
                  {data!.totalWatts >= 1000
                    ? `${(data!.totalWatts / 1000).toFixed(2)} kW`
                    : `${data!.totalWatts} W`}
                </Text>
              </View>

              {updatedStr && (
                <Text style={[s.updated, { color: colors.mutedForeground }]}>
                  {t.lastUpdated}: {updatedStr}
                </Text>
              )}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  refreshBtn: { padding: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  divider: { height: 1 },

  center: { alignItems: "center", padding: 24, gap: 8 },
  emptyWrap: { alignItems: "center", padding: 24, gap: 12 },
  emptyText: { fontSize: 13, textAlign: "center" },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 320,
    width: "100%",
  },
  hintText: { fontSize: 11, flex: 1 },

  colLabels: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  colLabel: { fontSize: 10, fontWeight: "600" },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deviceName: { fontSize: 12, fontWeight: "600", textAlign: "right" },
  deviceSub: { fontSize: 10, marginTop: 2 },

  barWrap: { paddingHorizontal: 6 },
  barTrack: {
    height: 10,
    backgroundColor: "#1a2236",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: { height: "100%", borderRadius: 5 },
  wattRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wattVal: { fontSize: 11, fontWeight: "700" },
  agoText: { fontSize: 10 },

  kwhVal: { fontSize: 12, fontWeight: "700", textAlign: "right" },
  kwhUnit: { fontSize: 10, textAlign: "right" },

  totalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 12, fontWeight: "600" },
  totalVal: { fontSize: 15, fontWeight: "700" },

  updated: { fontSize: 10, textAlign: "center", paddingBottom: 10, marginTop: 4 },
});
