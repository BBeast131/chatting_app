import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type InputBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function InputBox({
  value,
  onChangeText,
  onSend,
  disabled,
}: InputBoxProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Type a message..."
        placeholderTextColor="#999"
        multiline
        editable={!disabled}
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onSend}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 22,
    fontSize: 16,
    color: "#111",
  },
  button: {
    marginLeft: 10,
    backgroundColor: "#4f6cff",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#b0b5ff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
