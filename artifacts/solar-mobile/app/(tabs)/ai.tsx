import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { fetch as expoFetch } from "expo/fetch";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

let _convId: number | null = null;

async function getOrCreateConv(title: string): Promise<number> {
  if (_convId) return _convId;
  const res = await fetch(`${BASE}/api/gemini/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  const conv = await res.json();
  _convId = conv.id;
  return conv.id;
}

export default function AIScreen() {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const greetingMsg = useMemo<Message>(
    () => ({ id: "greeting", role: "assistant", content: t.aiGreeting }),
    [t.aiGreeting]
  );

  const [messages, setMessages] = useState<Message[]>([greetingMsg]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === "greeting" ? greetingMsg : m))
    );
  }, [greetingMsg]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const assistantId = `a-${Date.now() + 1}`;
    const placeholderMsg: Message = { id: assistantId, role: "assistant", content: "", pending: true };

    setMessages((prev) => [placeholderMsg, userMsg, ...prev]);
    setStreaming(true);

    try {
      const convId = await getOrCreateConv(
        `Solar Chat ${new Date().toLocaleDateString()}`
      );
      const res = await expoFetch(`${BASE}/api/gemini/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? "";
                accumulated += delta;
                const snap = accumulated;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: snap, pending: false } : m
                  )
                );
              } catch {}
            }
          }
        }
        if (!accumulated) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "⚠️ No response received.", pending: false }
                : m
            )
          );
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "⚠️ Error: Could not reach AI service. Check your connection.", pending: false }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  };

  const resetConv = () => {
    _convId = null;
    setMessages([greetingMsg]);
  };

  const canSend = !!input.trim() && !streaming;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPad }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.aiIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="cpu" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.aiAssistant}</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Gemini AI · Solar Expert
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={resetConv}
            style={[styles.newChatBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={15} color={colors.primary} />
            <Text style={[styles.newChatTxt, { color: colors.primary }]}>{t.newChat}</Text>
          </TouchableOpacity>
          <LangToggle />
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        inverted
        style={styles.messageList}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUser = item.role === "user";
          return (
            <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
              {!isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
                  <Feather name="cpu" size={12} color={colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                ]}
              >
                {item.pending && streaming ? (
                  <View style={styles.typingRow}>
                    <ActivityIndicator size="small" color={colors.mutedForeground} />
                    <Text style={[styles.typingText, { color: colors.mutedForeground }]}>...</Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.bubbleText,
                      {
                        color: isUser ? colors.primaryForeground : colors.foreground,
                        textAlign: isUser ? (isRTL ? "right" : "left") : (isRTL ? "right" : "left"),
                      },
                    ]}
                  >
                    {item.content}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom || (Platform.OS === "web" ? 16 : 12),
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.muted,
              color: colors.foreground,
              borderColor: colors.border,
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={t.typeMessage}
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={1000}
          onSubmitEditing={Platform.OS !== "web" ? sendMessage : undefined}
          returnKeyType="send"
          blurOnSubmit={Platform.OS !== "web"}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: canSend ? colors.primary : colors.muted },
          ]}
          onPress={sendMessage}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          {streaming ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <Feather
              name="send"
              size={18}
              color={canSend ? colors.primaryForeground : colors.mutedForeground}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 10, marginTop: 1 },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  newChatTxt: { fontSize: 12, fontWeight: "600" },
  messageList: { flex: 1 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  bubbleRowUser: { justifyContent: "flex-end" },
  bubbleRowAI: { justifyContent: "flex-start" },
  avatar: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "78%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  typingText: { fontSize: 14 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 14,
    borderWidth: 1,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
