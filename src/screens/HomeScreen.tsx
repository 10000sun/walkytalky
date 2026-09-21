import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Props {
  onSubmit: (minutes: number) => void;
}

export default function HomeScreen({ onSubmit }: Props) {
  const [minutesText, setMinutesText] = useState('30');

  const minutes = Number(minutesText);
  const isValid = Number.isFinite(minutes) && minutes > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>WalkyTalky</Text>
      <Text style={styles.subtitle}>원하는 산책 시간을 입력하세요</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={minutesText}
          onChangeText={setMinutesText}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="30"
        />
        <Text style={styles.unit}>분</Text>
      </View>

      <Pressable
        style={[styles.button, !isValid && styles.buttonDisabled]}
        onPress={() => isValid && onSubmit(minutes)}
        disabled={!isValid}
      >
        <Text style={styles.buttonText}>왕복 산책로 찾기</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  input: {
    fontSize: 48,
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
    minWidth: 100,
    textAlign: 'center',
    paddingVertical: 4,
  },
  unit: {
    fontSize: 24,
    marginLeft: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  buttonDisabled: {
    backgroundColor: '#a5a5a5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
