import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Transaction, TransactionCategory, TransactionInput, TransactionType, TransactionUpdate } from '../../domain/models/entities';
import { isValidIsoDate, toIsoDate } from '../../shared/utils/date';
import { CategoryIcon } from './CategoryIcon';
import { colors } from '../theme/colors';

type TransactionFormProps = {
  onSubmit: (payload: TransactionInput | TransactionUpdate) => Promise<void>;
  submitLabel: string;
  initialValue?: Transaction;
  initialPersonName?: string;
  onCancel?: () => void;
};

const getTypeOptions = (): TransactionType[] => ['lent', 'borrowed'];
const getCategoryOptions = (): TransactionCategory[] => ['food', 'shopping', 'travel', 'rent', 'other'];

export const TransactionForm = ({
  onSubmit,
  submitLabel,
  initialValue,
  initialPersonName,
  onCancel,
}: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>(initialValue?.type ?? 'lent');
  const [category, setCategory] = useState<TransactionCategory>(initialValue?.category ?? 'other');
  const [personName, setPersonName] = useState(initialPersonName ?? '');
  const [amount, setAmount] = useState(initialValue ? String(initialValue.amount) : '');
  const [date, setDate] = useState(initialValue?.date ?? toIsoDate());
  const [dueDate, setDueDate] = useState(initialValue?.dueDate ?? '');
  const [note, setNote] = useState(initialValue?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setType(initialValue?.type ?? 'lent');
    setCategory(initialValue?.category ?? 'other');
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
      setError('Enter a valid amount.');
      return;
    }

    if (!isValidIsoDate(date)) {
      setError('Date format: YYYY-MM-DD');
      return;
    }

    setError(null);
    setSubmitting(true);

    const payload: TransactionInput | TransactionUpdate = {
      type,
      category,
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
        setNote('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {getTypeOptions().map((opt) => (
          <Pressable
            key={opt}
            style={[styles.tab, type === opt ? styles.tabActive : null]}
            onPress={() => setType(opt)}
          >
            <Text style={[styles.tabText, type === opt ? styles.tabTextActive : null]}>
              {opt.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {getCategoryOptions().map((cat) => (
            <Pressable
              key={cat}
              style={[styles.catItem, category === cat ? styles.catItemActive : null]}
              onPress={() => setCategory(cat)}
            >
              <CategoryIcon category={cat} size={14} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Who is this with?</Text>
        <TextInput
          value={personName}
          onChangeText={setPersonName}
          placeholder="Contact Name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What was this for?"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.noteInput]}
          multiline
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        {onCancel ? (
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.submitBtn} onPress={submit} disabled={submitting}>
          <Text style={styles.submitBtnText}>{submitting ? '...' : submitLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDeep,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.primary,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  catItem: {
    opacity: 0.5,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 14,
  },
  catItemActive: {
    opacity: 1,
    borderColor: colors.primary + '40',
  },
  input: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.negative,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

