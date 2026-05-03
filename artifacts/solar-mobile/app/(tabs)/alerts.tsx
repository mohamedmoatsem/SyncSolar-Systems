import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/hooks/useApi";
import { StatusBadge } from "@/components/StatusBadge";

interface Alert {
  id: number;
  type: string;
  severity: string;
  message: string;
  status: string;
  timestamp: string;
  resolvedAt: string | null;
}

const SEV_COLORS: Record<string, string> = {};

function AlertItem({ alert }: { alert: Alert }) {
  const colors = useColors();
  const { t } = useLanguage();
  const qc = useQueryClient();

  const sevColor =
    alert.severity === "critical" ? colors.destructive
    : alert.severity === "warning" ? colors.warning
    : colors.secondary;

  const mutation = useMutation({
    mutationFn: () => apiFetch(`/api/alerts/${alert.id}/resolve`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const ts = new Date(alert.timestamp).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const sevLabel =
    alert.severity === "critical" ? t.critical
    : alert.severity === "warning" ? t.warning
    : t.info;

  const statusLabel = alert.status === "active" ? t.active : t.resolved;

  return (
    <View style={[styles.alertCard, { backgroundColor: colors.card, borderLeftColor: sevColor, borderColor: colors.border }]}>
      <View style={styles.alertTop}>
        <View style={[styles.sevIcon, { backgroundColor: sevColor + "22" }]}>
          <Feather
            name={alert.severity === "critical" ? "alert-octagon" : alert.severity === "warning" ? "alert-triangle" : "info"}
            size={14}
            color={sevColor}
          />
        </View>
        <View style={styles.alertMeta}>
          <StatusBadge status={alert.severity} label={sevLabel} size="sm" />
          <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>{ts}</Text>
        </View>
        <StatusBadge status={alert.status} label={statusLabel} size="sm" />
      </View>
      <Text style={[styles.alertMsg, { color: colors.foreground }]}>{alert.message}</Text>
      {alert.status === "active" && (
        <TouchableOpacity
          style={[styles.resolveBtn, { borderColor: colors.border }]}
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          <Feather name="check" size={12} color={colors.success} />
          <Text style={[styles.resolveTxt, { color: colors.success }]}>{t.resolve}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AlertsScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBotPad = Platform.OS === "web" ? 34 : 0;

  const { data, isLoading, refetch, isError } = useQuery<Alert[]>({
    queryKey: ["alerts", filter],
    queryFn: () => apiFetch(`/api/alerts?status=${filter}`),
    refetchInterval: 10000,
  });

  const filters: { key: "active" | "all" | "resolved"; label: string }[] = [
    { key: "active", label: t.active },
    { key: "resolved", label: t.resolved },
    { key: "all", label: "All" },
  ];

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(a) => String(a.id)}
      contentContainerStyle={{ paddingBottom: 100 + webBotPad, paddingTop: webTopPad }}
      style={[styles.list, { backgroundColor: colors.background }]}
      scrollEnabled={!!(data && data.length > 0)}
      refreshing={isLoading}
      onRefresh={refetch}
      ListHeaderComponent={
        <>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.alerts}</Text>
            {data && <Text style={[styles.count, { color: colors.mutedForeground }]}>{data.length}</Text>}
          </View>
          <View style={styles.filters}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: filter === f.key ? colors.primary : colors.muted,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.filterTxt, { color: filter === f.key ? colors.primaryForeground : colors.mutedForeground }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
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
            <Feather name="bell-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noAlerts}</Text>
          </View>
        )
      }
      renderItem={({ item }) => <AlertItem alert={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterTxt: { fontSize: 12, fontWeight: "600" },
  alertCard: {
    marginHorizontal: 16,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 4,
    gap: 8,
  },
  alertTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevIcon: { width: 28, height: 28, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  alertMeta: { flex: 1, gap: 2 },
  alertTime: { fontSize: 10 },
  alertMsg: { fontSize: 13, lineHeight: 18 },
  resolveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  resolveTxt: { fontSize: 11, fontWeight: "600" },
  center: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, marginTop: 8 },
});
