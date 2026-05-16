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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { CachedBadge } from "@/components/CachedBadge";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { apiFetch } from "@/hooks/useApi";

interface Alert {
  id: number;
  type: string;
  severity: string;
  message: string;
  status: string;
  timestamp: string;
  resolvedAt: string | null;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "< 1m";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function AlertItem({ alert, isOnline }: { alert: Alert; isOnline: boolean }) {
  const colors = useColors();
  const { t } = useLanguage();
  const qc = useQueryClient();

  const sevColor =
    alert.severity === "critical" ? colors.destructive
    : alert.severity === "warning" ? colors.warning
    : colors.secondary;

  const sevIcon: keyof typeof Feather.glyphMap =
    alert.severity === "critical" ? "alert-octagon"
    : alert.severity === "warning" ? "alert-triangle"
    : "info";

  const [resolveErr, setResolveErr] = useState(false);

  const mutation = useMutation({
    mutationFn: () => apiFetch(`/api/alerts/${alert.id}/resolve`, { method: "PATCH" }),
    onSuccess: () => {
      setResolveErr(false);
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    onError: () => {
      setResolveErr(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    },
  });

  const sevLabel =
    alert.severity === "critical" ? t.critical
    : alert.severity === "warning" ? t.warning
    : t.info;

  return (
    <View
      style={[
        styles.alertCard,
        { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sevColor },
      ]}
    >
      <View style={styles.alertHeader}>
        <View style={[styles.sevBadge, { backgroundColor: sevColor + "22" }]}>
          <Feather name={sevIcon} size={13} color={sevColor} />
          <Text style={[styles.sevText, { color: sevColor }]}>{sevLabel}</Text>
        </View>
        <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>
          {timeAgo(alert.timestamp)}
        </Text>
        {alert.status === "resolved" && (
          <View style={[styles.resolvedBadge, { backgroundColor: colors.muted }]}>
            <Feather name="check-circle" size={11} color={colors.mutedForeground} />
            <Text style={[styles.resolvedText, { color: colors.mutedForeground }]}>{t.resolved}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.alertMsg, { color: colors.foreground }]}>{alert.message}</Text>

      {resolveErr && (
        <Text style={[styles.errTxt, { color: colors.destructive }]}>
          {t.resolveError}
        </Text>
      )}

      {alert.status === "active" && (
        <TouchableOpacity
          style={[
            styles.resolveBtn,
            {
              borderColor: resolveErr
                ? colors.destructive + "55"
                : isOnline
                ? colors.success + "55"
                : colors.border,
              backgroundColor: resolveErr
                ? colors.destructive + "11"
                : isOnline
                ? colors.success + "11"
                : colors.muted,
              opacity: isOnline ? 1 : 0.5,
            },
          ]}
          onPress={() => { setResolveErr(false); mutation.mutate(); }}
          disabled={mutation.isPending || !isOnline}
          activeOpacity={0.7}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color={colors.success} />
          ) : (
            <>
              <Feather
                name={resolveErr ? "alert-circle" : "check"}
                size={13}
                color={resolveErr ? colors.destructive : isOnline ? colors.success : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.resolveTxt,
                  { color: resolveErr ? colors.destructive : isOnline ? colors.success : colors.mutedForeground },
                ]}
              >
                {resolveErr ? t.retryResolve : t.resolve}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

type FilterKey = "active" | "all" | "resolved";

export default function AlertsScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isOnline = useNetworkStatus();
  const topPad = Platform.OS === "web" ? 67 : 0;
  const [filter, setFilter] = useState<FilterKey>("active");

  const { data, isLoading, refetch, isRefetching, isError, dataUpdatedAt } = useQuery<Alert[]>({
    queryKey: ["alerts", filter],
    queryFn: () => apiFetch(`/api/alerts?status=${filter}`),
    refetchInterval: 10000,
  });

  const filters: { key: FilterKey; label: string }[] = [
    { key: "active", label: t.active },
    { key: "resolved", label: t.resolved },
    { key: "all", label: t.all },
  ];

  const criticalCount = data?.filter((a) => a.severity === "critical" && a.status === "active").length ?? 0;
  const warningCount = data?.filter((a) => a.severity === "warning" && a.status === "active").length ?? 0;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(a) => String(a.id)}
      contentContainerStyle={{ paddingBottom: 110 }}
      style={[styles.list, { backgroundColor: colors.background }]}
      refreshing={isRefetching && !isLoading}
      onRefresh={refetch}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={[styles.header, { paddingTop: topPad }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.alerts}</Text>
              {data && (
                <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                  {data.length} {filter === "active" ? t.active : filter === "resolved" ? t.resolved : t.all}
                </Text>
              )}
            </View>
            <View style={styles.headerRight}>
              <CachedBadge dataUpdatedAt={dataUpdatedAt} />
              <LangToggle />
            </View>
          </View>

          {filter === "active" && data && (criticalCount > 0 || warningCount > 0) && (
            <View style={styles.summaryRow}>
              {criticalCount > 0 && (
                <View style={[styles.summaryChip, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
                  <Feather name="alert-octagon" size={12} color={colors.destructive} />
                  <Text style={[styles.summaryTxt, { color: colors.destructive }]}>{criticalCount} {t.critical}</Text>
                </View>
              )}
              {warningCount > 0 && (
                <View style={[styles.summaryChip, { backgroundColor: colors.warning + "22", borderColor: colors.warning + "44" }]}>
                  <Feather name="alert-triangle" size={12} color={colors.warning} />
                  <Text style={[styles.summaryTxt, { color: colors.warning }]}>{warningCount} {t.warning}</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.filtersRow, { borderBottomColor: colors.border }]}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterBtn,
                  filter === f.key
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: "transparent", borderColor: colors.border },
                ]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
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
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.loading}</Text>
          </View>
        ) : isError && !data ? (
          <View style={styles.center}>
            <Feather name="wifi-off" size={40} color={colors.destructive} />
            <Text style={[styles.emptyText, { color: colors.destructive }]}>{t.errorLoad}</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Feather name="bell-off" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noAlerts}</Text>
          </View>
        )
      }
      renderItem={({ item }) => <AlertItem alert={item} isOnline={isOnline} />}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  summaryChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderRadius: 20,
  },
  summaryTxt: { fontSize: 11, fontWeight: "600" },
  filtersRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterTxt: { fontSize: 12, fontWeight: "600" },
  alertCard: {
    marginHorizontal: 16, padding: 14, borderWidth: 1, borderLeftWidth: 3, borderRadius: 10, gap: 10,
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  sevText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  alertTime: { fontSize: 11, flex: 1, textAlign: "right" },
  resolvedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  resolvedText: { fontSize: 10, fontWeight: "600" },
  alertMsg: { fontSize: 13, lineHeight: 19 },
  resolveBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 7, paddingHorizontal: 12,
    borderWidth: 1, borderRadius: 8, alignSelf: "flex-start", minHeight: 32,
  },
  resolveTxt: { fontSize: 12, fontWeight: "600" },
  errTxt: { fontSize: 11, marginBottom: 4 },
  center: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, marginTop: 8 },
});
