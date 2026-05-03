import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/hooks/useApi";
import { StatusBadge } from "@/components/StatusBadge";

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const icon = TYPE_ICONS[device.type] ?? "cpu";
  const typeLabel = t[device.type as keyof typeof t] ?? device.type;
  const statusLabel =
    device.status === "on" ? t.on
    : device.status === "off" ? t.off
    : t.fault;

  return (
    <View style={[styles.deviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.deviceIcon, { backgroundColor: colors.primary + "22" }]}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: colors.foreground }]}>{device.name}</Text>
        <Text style={[styles.deviceMeta, { color: colors.mutedForeground }]}>
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
        trackColor={{ false: colors.muted, true: colors.primary + "66" }}
        thumbColor={device.isEnabled ? colors.primary : colors.mutedForeground}
        disabled={mutation.isPending}
      />
    </View>
  );
}

export default function DevicesScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBotPad = Platform.OS === "web" ? 34 : 0;

  const { data, isLoading, refetch, isError } = useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: () => apiFetch("/api/devices"),
    refetchInterval: 15000,
  });

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(d) => String(d.id)}
      contentContainerStyle={{ paddingBottom: 100 + webBotPad, paddingTop: webTopPad }}
      style={[styles.list, { backgroundColor: colors.background }]}
      scrollEnabled={!!(data && data.length > 0)}
      refreshing={isLoading}
      onRefresh={refetch}
      ListHeaderComponent={
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.devices}</Text>
          {data && (
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {data.filter((d) => d.isEnabled).length}/{data.length} {t.enabled}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
        ) : isError ? (
          <View style={styles.center}>
            <Text style={{ color: colors.destructive }}>{t.errorLoad}</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Feather name="cpu" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noDevices}</Text>
          </View>
        )
      }
      renderItem={({ item }) => <DeviceItem device={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  count: { fontSize: 13 },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: { flex: 1, gap: 4 },
  deviceName: { fontSize: 14, fontWeight: "600" },
  deviceMeta: { fontSize: 12 },
  deviceBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  powerRating: { fontSize: 11, fontWeight: "500" },
  center: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, marginTop: 8 },
});
