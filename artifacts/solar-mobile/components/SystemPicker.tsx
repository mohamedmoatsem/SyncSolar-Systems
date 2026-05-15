import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/hooks/useApi";

interface SolarSystem {
  id: number;
  name: string;
  location: string;
}

const C = {
  bg: "#090e1a",
  card: "#0d1326",
  border: "#202940",
  muted: "#191f30",
  mutedFg: "#758ab0",
  text: "#eeeee8",
  primary: "#ff8c1a",
  secondary: "#00c8d8",
};

export function SystemPicker() {
  const { user, selectedSystemId, setSelectedSystem } = useAuth();
  const [open, setOpen] = useState(false);
  const [systems, setSystems] = useState<SolarSystem[]>([]);
  const [loading, setLoading] = useState(false);

  if (user?.role !== "technician") return null;

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<SolarSystem[]>("/api/solar-systems");
      setSystems(data);
    } catch {}
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    fetchSystems();
  };

  const currentSystem = systems.find((s) => s.id === selectedSystemId);
  const label = currentSystem?.name ?? `المنظومة #${selectedSystemId}`;

  return (
    <>
      <Pressable style={s.chip} onPress={handleOpen}>
        <Feather name="layers" size={14} color={C.secondary} />
        <Text style={s.chipText} numberOfLines={1}>{label}</Text>
        <Feather name="chevron-down" size={12} color={C.mutedFg} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={s.overlay} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>اختر المنظومة</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Feather name="x" size={20} color={C.mutedFg} />
              </Pressable>
            </View>

            {loading ? (
              <ActivityIndicator color={C.primary} style={{ margin: 24 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {systems.map((sys) => {
                  const isActive = sys.id === selectedSystemId;
                  return (
                    <Pressable
                      key={sys.id}
                      style={[s.sysRow, isActive && s.sysRowActive]}
                      onPress={() => {
                        setSelectedSystem(sys.id);
                        setOpen(false);
                      }}
                    >
                      <View style={s.sysIcon}>
                        <Feather
                          name="sun"
                          size={18}
                          color={isActive ? C.primary : C.mutedFg}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.sysName, isActive && s.sysNameActive]}>
                          {sys.name}
                        </Text>
                        <Text style={s.sysLoc}>{sys.location}</Text>
                      </View>
                      {isActive && (
                        <Feather name="check-circle" size={16} color={C.primary} />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#131b2e",
    borderWidth: 1,
    borderColor: "#202940",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    maxWidth: 180,
  },
  chipText: { color: C.text, fontSize: 12, fontWeight: "600", flex: 1 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: C.border,
    maxHeight: "60%",
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  sheetTitle: { color: C.text, fontSize: 16, fontWeight: "700" },

  sysRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#141c2e",
  },
  sysRowActive: { backgroundColor: "rgba(255,140,26,0.06)" },
  sysIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  sysName: { color: C.mutedFg, fontSize: 14, fontWeight: "600" },
  sysNameActive: { color: C.text },
  sysLoc: { color: C.mutedFg, fontSize: 12, marginTop: 2 },
});
