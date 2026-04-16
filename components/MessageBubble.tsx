import { ChatMessage } from "@/services/websocketService";
import { StyleSheet, Text, View } from "react-native";

type MessageBubbleProps = {
  message: ChatMessage;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.direction === "outgoing";

  return (
    <View
      style={[styles.container, isMine ? styles.outgoing : styles.incoming]}
    >
      <Text style={[styles.author, isMine && styles.outgoingAuthor]}>
        {isMine ? "You" : message.author}
      </Text>
      <Text style={[styles.text, isMine && styles.outgoingText]}>
        {message.text}
      </Text>
      <Text style={[styles.timestamp, isMine && styles.outgoingTimestamp]}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 16,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  incoming: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  outgoing: {
    alignSelf: "flex-end",
    backgroundColor: "#4f6cff",
  },
  author: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  outgoingAuthor: {
    color: "#dbeafe",
  },
  text: {
    fontSize: 16,
    color: "#111",
    lineHeight: 22,
  },
  outgoingText: {
    color: "#fff",
  },
  timestamp: {
    marginTop: 8,
    fontSize: 10,
    color: "#666",
    textAlign: "right",
  },
  outgoingTimestamp: {
    color: "#e5e7ff",
  },
});
