import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Transaction, TransactionInput, TransactionType, TransactionUpdate } from '../../domain/models/entities';
import { isValidIsoDate, toIsoDate } from '../../shared/utils/date';
import { colors } from '../theme/colors';

type TransactionFormProps = {
  onSubmit: (payload: TransactionInput | TransactionUpdate) => Promise<void>;
  submitLabel: string;
  initialValue?: Transaction;
  initialPersonName?: string;
  onCancel?: () => void;
};

const getTypeOptions = (): TransactionType[] => ['lent', 'borrowed'];

export const TransactionForm = ({
  onSubmit,
  submitLabel,
  initialValue,
  initialPersonName,
  onCancel,
}: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>(initialValue?.type ?? 'lent');
  const [personName, setPersonName] = useState(initialPersonName ?? '');
  const [amount, setAmount] = useState(initialValue ? String(initialValue.amount) : '');
  const [date, setDate] = useState(initialValue?.date ?? toIsoDate());
  const [dueDate, setDueDate] = useState(initialValue?.dueDate ?? '');
  const [note, setNote] = useState(initialValue?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setType(initialValue?.type ?? 'lent');
    setPersonName(initialPersonName ?? '');
    setAmount(initialValue ? String(initialValue.amount) : '');
    setDate(initialValue?.date ?? toIsoDate());
    setDueDate(initialValue?.dueDate ?? '');
    setNote(initialValue?.note ?? '');
  }, [initialPersonName, initialValue]);

  const submit = async () => {
    const parsedAmount = Number(amount);

    if (!personName.trim()) {
      setError('Person name is required.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    if (!isValidIsoDate(date)) {
      setError('Date must be in YYYY-MM-DD format.');
      return;
    }

    if (dueDate && !isValidIsoDate(dueDate)) {
      setError('Due date must be in YYYY-MM-DD format.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const payload: TransactionInput | TransactionUpdate = {
      type,
      personName: personName.trim(),
      amount: parsedAmount,
      date,
      dueDate: dueDate || undefined,
      note: note.trim() || undefined,
      ...(initialValue ? { status: initialValue.status } : {}),
    };

    try {
      await onSubmit(payload);

      if (!initialValue) {
        setPersonName('');
        setAmount('');
        setDate(toIsoDate());
        setDueDate('');
        setNote('');
        setType('lent');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type</Text>
      <View style={styles.segmentedControl}>
        {getTypeOptions().map((option) => (
          <Pressable
            key={option}
            style={[styles.segment, type === option ? styles.segmentActive : null]}
            onPress={() => setType(option)}
          >
            <Text style={[styles.segmentText, type === option ? styles.segmentTextActive : null]}>
              {option.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Person name</Text>
      <TextInput
        value={personName}
        onChangeText={setPersonName}
        placeholder="e.g. Alex"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="e.g. 120"
        placeholderTextColor={colors.textSecondary}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="2026-04-23"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />

      <Text style={styles.label}>Due date (optional)</Text>
      <TextInput
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="2026-05-10"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Reason or context"
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, styles.noteInput]}
        multiline
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        {onCancel ? (
          <Pressable style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.primaryButton} onPress={submit} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Saving...' : submitLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  segmentText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  segmentTextActive: {
    color: '#0D131D',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.negative,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#0D131D',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.6,
  },
});
