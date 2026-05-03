import React, { useRef, useState } from "react";
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
import { apiUrl } from "@/hooks/useApi";
import { fetch as expoFetch } from "expo/fetch";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

let _convId: number | null = null;

async function getOrCreateConv(): Promise<number> {
  if (_convId) return _convId;
  const base = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
  const res = await fetch(`${base}/api/gemini/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: `Solar Chat ${new Date().toLocaleDateString()}` }),
  });
  const conv = await res.json();
  _convId = conv.id;
  return conv.id;
}

export default function AIScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "assistant", content: t.aiGreeting },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [userMsg, ...prev]);

    setStreaming(true);
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [{ id: assistantId, role: "assistant", content: "" }, ...prev]);

    try {
      const convId = await getOrCreateConv();
      const base = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
      const res = await expoFetch(`${base}/api/gemini/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? "";
                accumulated += delta;
                const snapshot = accumulated;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m))
                );
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: "⚠️ Error: Could not reach AI service." } : m
        )
      );
    } finally {
      setStreaming(false);
    }
  };

  const resetConv = () => {
    _convId = null;
    setMessages([{ id: "init", role: "assistant", content: t.aiGreeting }]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: webTopPad }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.aiAssistant}</Text>
        <TouchableOpacity onPress={resetConv} style={styles.newChatBtn}>
          <Feather name="plus" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        inverted
        style={styles.messageList}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user"
                ? [styles.userBubble, { backgroundColor: colors.primary }]
                : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }],
            ]}
          >
            {item.role === "assistant" && item.content === "" && streaming ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : (
              <Text
                style={[
                  styles.bubbleText,
                  { color: item.role === "user" ? colors.primaryForeground : colors.foreground },
                ]}
              >
                {item.content}
              </Text>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
          value={input}
          onChangeText={setInput}
          placeholder={t.typeMessage}
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: streaming || !input.trim() ? colors.muted : colors.primary },
          ]}
          onPress={sendMessage}
          disabled={streaming || !input.trim()}
        >
          {streaming ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <Feather name="send" size={18} color={streaming || !input.trim() ? colors.mutedForeground : colors.primaryForeground} />
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  newChatBtn: { padding: 4 },
  messageList: { flex: 1 },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
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
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
