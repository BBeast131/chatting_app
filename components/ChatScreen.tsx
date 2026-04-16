import InputBox from "@/components/InputBox";
import MessageBubble from "@/components/MessageBubble";
import WebSocketService, {
    ChatMessage,
    ConnectionStatus,
} from "@/services/websocketService";
import Constants from "expo-constants";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  connected: "Connected",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting…",
  error: "Connection error",
};

const statusColors: Record<ConnectionStatus, string> = {
  connecting: "#ffb300",
  connected: "#22c55e",
  disconnected: "#ef4444",
  reconnecting: "#f59e0b",
  error: "#b91c1c",
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<WebSocketService | null>(null);

  const wsUrl = Constants.expoConfig?.extra?.WS_URL as string | undefined;
  console.log("weUrl", wsUrl);
  const wsUser = Constants.expoConfig?.extra?.WS_USER as string | undefined;
  const wsToken = Constants.expoConfig?.extra?.WS_TOKEN as string | undefined;

  const connectionLabel = statusLabels[status] ?? "Unknown";
  const connectionColor = statusColors[status] ?? "#000";

  useEffect(() => {
    if (!wsUrl || !wsUser || !wsToken) {
      setLoading(false);
      return;
    }

    const service = new WebSocketService(
      {
        url: wsUrl,
        user: wsUser,
        token: wsToken,
      },
      {
        onMessage: (message) => {
          setMessages((prev) => [...prev, message]);
        },
        onStatus: (newStatus) => {
          setStatus(newStatus);
          setLoading(false);
        },
      },
    );

    socketRef.current = service;
    service.connect();

    return () => {
      service.close();
    };
  }, [wsUrl, wsUser, wsToken]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current) {
      return;
    }

    const outgoingMessage: ChatMessage = {
      id: `${Date.now()}-out`,
      author: wsUser ?? "You",
      text: trimmed,
      timestamp: new Date().toISOString(),
      direction: "outgoing",
    };

    setMessages((prev) => [...prev, outgoingMessage]);
    setInput("");

    try {
      socketRef.current.sendMessage(trimmed);
    } catch (error) {
      Alert.alert("Send failed", "Unable to send message. Reconnecting...");
    }
  };

  //   const disabledSend = !input.trim() || status !== "connected";
  const disabledSend = false;

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const headerText = useMemo(() => {
    if (!wsUrl || !wsUser || !wsToken) {
      return "Missing WebSocket credentials. Add them to .env.";
    }
    return "Real-time WebSocket Chat";
  }, [wsUrl, wsUser, wsToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{headerText}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: connectionColor }]}
        >
          <Text style={styles.statusText}>{connectionLabel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f6cff" />
          <Text style={styles.loadingText}>Starting chat service…</Text>
        </View>
      )}

      {!loading && (!wsUrl || !wsUser || !wsToken) ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Missing environment configuration.
          </Text>
          <Text style={styles.helpText}>
            Create a local .env file with WS_URL, WS_USER, and WS_TOKEN.
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
          <InputBox
            value={input}
            onChangeText={setInput}
            onSend={handleSend}
            disabled={disabledSend}
          />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#f8fbff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#4f6cff",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#b91c1c",
    textAlign: "center",
  },
  helpText: {
    marginTop: 8,
    textAlign: "center",
    color: "#4b5563",
  },
  content: {
    flex: 1,
  },
  messageList: {
    flexGrow: 1,
    paddingVertical: 12,
  },
});
