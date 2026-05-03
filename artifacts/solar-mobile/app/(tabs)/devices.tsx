import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { StatusBadge } from "@/components/StatusBadge";
import { apiFetch } from "@/hooks/useApi";

interface Device {
  id: number;
  name: string;
  type: string;
  status: string;
  isEnabled: boolean;
  powerRating: number;
  location: string;
}

const TYPE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  inverter: "refresh-cw",
  charge_controller: "battery-charging",
  load: "zap",
  sensor: "activity",
  pump: "droplet",
};

const TYPE_COLORS: Record<string, string> = {
  inverter: "#ff8c1a",
  charge_controller: "#22c55e",
  load: "#00c8d8",
  sensor: "#a855f7",
  pump: "#f59e0b",
};

function DeviceItem({ device }: { device: Device }) {
  const colors = useColors();
  const { t } = useLanguage();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (isEnabled: boolean) =>
      apiFetch(`/api/devices/${device.id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ isEnabled }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    },
  });

  const icon = TYPE_ICONS[device.type] ?? "cpu";
  const typeColor = TYPE_COLORS[device.type] ?? colors.primary;
  const typeLabel = (t as any)[device.type] ?? device.type;
  const statusLabel =
    device.status === "on" ? t.on
    : device.status === "off" ? t.off
    : t.fault;

  return (
    <View style={[styles.deviceCard, { backgroundColor: colors.card }]}>
      <View style={[styles.typeBar, { backgroundColor: typeColor }]} />
      <View style={styles.deviceContent}>
        <View style={[styles.deviceIcon, { backgroundColor: typeColor + "22" }]}>
          <Feather name={icon} size={20} color={typeColor} />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={[styles.deviceName, { color: colors.foreground }]} numberOfLines={1}>
            {device.name}
          </Text>
          <Text style={[styles.deviceMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {typeLabel} · {device.location}
          </Text>
          <View style={styles.deviceBottom}>
            <StatusBadge status={device.status} label={statusLabel} size="sm" />
            <Text style={[styles.powerRating, { color: colors.mutedForeground }]}>
              {device.powerRating}W
            </Text>
          </View>
        </View>
        <Switch
          value={device.isEnabled}
          onValueChange={(v) => mutation.mutate(v)}
          trackColor={{ false: colors.muted, true: colors.primary + "88" }}
          thumbColor={device.isEnabled ? colors.primary : colors.mutedForeground}
          disabled={mutation.isPending}
          style={{ opacity: mutation.isPending ? 0.5 : 1 }}
        />
      </View>
    </View>
  );
}

export default function DevicesScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch, isRefetching, isError } = useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: () => apiFetch("/api/devices"),
    refetchInterval: 15000,
  });

  const enabledCount = data?.filter((d) => d.isEnabled).length ?? 0;
  const totalCount = data?.length ?? 0;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(d) => String(d.id)}
      contentContainerStyle={{ paddingBottom: 110 }}
      style={[styles.list, { backgroundColor: colors.background }]}
      refreshing={isRefetching && !isLoading}
      onRefresh={refetch}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={[styles.header, { paddingTop: topPad }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.devices}</Text>
              {data && (
                <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                  {enabledCount}/{totalCount} {t.enabled}
                </Text>
              )}
            </View>
            <LangToggle />
          </View>

          {data && (
            <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{totalCount}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.totalDevices}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>{enabledCount}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.enabled}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.destructive }]}>
                  {totalCount - enabledCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.disabled}</Text>
              </View>
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.loading}</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Feather name="wifi-off" size={40} color={colors.destructive} />
            <Text style={[styles.emptyText, { color: colors.destructive }]}>{t.errorLoad}</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Feather name="cpu" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noDevices}</Text>
          </View>
        )
      }
      renderItem={({ item }) => <DeviceItem device={item} />}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#202940",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  statDivider: { width: 1 },
  deviceCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 0,
    overflow: "hidden",
  },
  typeBar: { width: 3 },
  deviceContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  deviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: { flex: 1, gap: 4 },
  deviceName: { fontSize: 14, fontWeight: "600" },
  deviceMeta: { fontSize: 12 },
  deviceBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  powerRating: { fontSize: 11, fontWeight: "600" },
  center: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, marginTop: 8 },
});
