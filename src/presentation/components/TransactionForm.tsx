import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Modal, Keyboard, Platform } from 'react-native';
import { NumberPicker } from './NumberPicker';

import { Transaction, TransactionCategory, TransactionInput, TransactionType, TransactionUpdate } from '../../domain/models/entities';
import { isValidIsoDate, toIsoDate } from '../../shared/utils/date';
import { CategoryIcon } from './CategoryIcon';
import { colors } from '../theme/colors';
import { priorityColors } from '../theme/priorityColors';

type TransactionFormProps = {
  onSubmit: (payload: TransactionInput | TransactionUpdate) => Promise<void>;
  submitLabel: string;
  initialValue?: Transaction;
  initialPersonName?: string;
  onCancel?: () => void;
  people?: string[];
};

const getTypeOptions = (): TransactionType[] => ['lent', 'borrowed'];
const getCategoryOptions = (): TransactionCategory[] => ['food', 'shopping', 'travel', 'rent', 'other'];
import type { TransactionPriority } from '../../domain/models/entities';

const getPriorityOptions = (): TransactionPriority[] => ['low', 'medium', 'high', 'urgent'];

export const TransactionForm = ({
  onSubmit,
  submitLabel,
  initialValue,
  initialPersonName,
  onCancel,
  people,
}: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>(initialValue?.type ?? 'lent');
  const [category, setCategory] = useState<TransactionCategory>(initialValue?.category ?? 'other');
  const [personName, setPersonName] = useState(initialPersonName ?? '');
  const [amount, setAmount] = useState(initialValue ? String(initialValue.amount) : '');
  const [date, setDate] = useState(initialValue?.date ?? toIsoDate());
  const [dueDate, setDueDate] = useState(initialValue?.dueDate ?? '');
  const [priority, setPriority] = useState<TransactionPriority>((initialValue as any)?.priority ?? 'medium');
  const [note, setNote] = useState(initialValue?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Separate states for the picker to avoid Date object rollover bugs
  const [tYear, setTYear] = useState(new Date(date).getFullYear());
  const [tMonth, setTMonth] = useState(new Date(date).getMonth() + 1);
  const [tDay, setTDay] = useState(new Date(date).getDate());

  const [tdYear, setTdYear] = useState(dueDate ? new Date(dueDate).getFullYear() : new Date().getFullYear());
  const [tdMonth, setTdMonth] = useState(dueDate ? new Date(dueDate).getMonth() + 1 : new Date().getMonth() + 1);
  const [tdDay, setTdDay] = useState(dueDate ? new Date(dueDate).getDate() : new Date().getDate());

  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState<string[]>([]);
  const [nameInputFocused, setNameInputFocused] = useState(false);

  useEffect(() => {
    setType(initialValue?.type ?? 'lent');
    setCategory(initialValue?.category ?? 'other');
    setPersonName(initialPersonName ?? '');
    setAmount(initialValue ? String(initialValue.amount) : '');
    setDate(initialValue?.date ?? toIsoDate());
    setDueDate(initialValue?.dueDate ?? '');
    setNote(initialValue?.note ?? '');
    setPriority((initialValue as any)?.priority ?? 'medium');

    const d = new Date(initialValue?.date ?? toIsoDate());
    setTYear(d.getFullYear());
    setTMonth(d.getMonth() + 1);
    setTDay(d.getDate());

    const dd = new Date(initialValue?.dueDate ?? toIsoDate());
    setTdYear(dd.getFullYear());
    setTdMonth(dd.getMonth() + 1);
    setTdDay(dd.getDate());
  }, [initialPersonName, initialValue]);

  useEffect(() => {
    if (!people || personName.trim() === '') {
      setFilteredPeople([]);
      setSuggestionsVisible(false);
      return;
    }

    const q = personName.trim().toLowerCase();
    const matches = people.filter((p) => p.toLowerCase().includes(q));

    // Sort matches: startsWith first, then includes
    const sorted = [...matches].sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q);
      const bStarts = b.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });

    setFilteredPeople(sorted.slice(0, 5));
    setSuggestionsVisible(sorted.length > 0 && nameInputFocused);
  }, [personName, people, nameInputFocused]);

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
      priority: priority as any,
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

      <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }]}>
        <View style={{}}>
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

        <View style={{ width: 140, marginLeft: 12 }}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {getPriorityOptions().map((p) => (
              <Pressable
                key={p}
                style={[styles.priorityItem, {
                  backgroundColor: priority === p ? priorityColors[p].bg : colors.surface,
                  borderColor: priority === p ? priorityColors[p].bg : colors.border,
                }]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.priorityText, {
                  color: priority === p ? priorityColors[p].text : colors.textSecondary,
                  fontWeight: '300',
                }]}>{p[0].toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.inputGroup, { zIndex: 100, elevation: 10 }]}>
        <Text style={styles.label}>Who is this with?</Text>
        <View style={{ position: 'relative', zIndex: 101 }}>
          <TextInput
            value={personName}
            onChangeText={setPersonName}
            placeholder="Contact Name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            onFocus={() => setNameInputFocused(true)}
            onBlur={() => setTimeout(() => setNameInputFocused(false), 300)}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {suggestionsVisible && filteredPeople.length > 0 ? (
            <View style={styles.suggestionsAbsolute}>
              {filteredPeople.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    setPersonName(s);
                    setSuggestionsVisible(false);
                    Keyboard.dismiss();
                  }}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    pressed && { backgroundColor: colors.surfaceAlt }
                  ]}
                >
                  <Feather name="user" size={14} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
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
          <Pressable style={styles.input} onPress={() => {
            const d = new Date(date);
            setTYear(d.getFullYear());
            setTMonth(d.getMonth() + 1);
            setTDay(d.getDate());
            setShowDatePicker(true);
          }}>
            <Text style={{ color: colors.textPrimary }}>{date}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Due Date (optional)</Text>
        <Pressable style={styles.input} onPress={() => {
          const d = new Date(dueDate || date);
          setTdYear(d.getFullYear());
          setTdMonth(d.getMonth() + 1);
          setTdDay(d.getDate());
          setShowDueDatePicker(true);
        }}>
          <Text style={{ color: colors.textPrimary }}>{dueDate || 'Select due date'}</Text>
        </Pressable>
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

      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerCard, styles.pickerCardModal]}>
            <View style={styles.dragIndicator} />
            <Text style={[styles.label, { textAlign: 'center', fontSize: 16, marginBottom: 8 }]}>Pick Date</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 12, marginBottom: 4 }}>
              Scroll to select year, month, and day
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Year</Text>
                <NumberPicker
                  value={tYear}
                  min={2000}
                  max={2100}
                  onChange={setTYear}
                  width={70}
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Month</Text>
                <NumberPicker
                  value={tMonth}
                  min={1}
                  max={12}
                  onChange={setTMonth}
                  width={50}
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Day</Text>
                <NumberPicker
                  value={tDay}
                  min={1}
                  max={new Date(tYear, tMonth, 0).getDate()}
                  onChange={setTDay}
                  width={60}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18, justifyContent: 'center' }}>
              <Pressable onPress={() => setShowDatePicker(false)} style={styles.cancelBtn}><Text style={{ color: colors.textSecondary }}>Cancel</Text></Pressable>
              <Pressable onPress={() => {
                const m = tMonth < 10 ? `0${tMonth}` : tMonth;
                const d = tDay < 10 ? `0${tDay}` : tDay;
                setDate(`${tYear}-${m}-${d}`);
                setShowDatePicker(false);
              }} style={styles.submitBtn}><Text style={styles.submitBtnText}>Set</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDueDatePicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerCard, styles.pickerCardModal]}>
            <View style={styles.dragIndicator} />
            <Text style={[styles.label, { textAlign: 'center', fontSize: 16, marginBottom: 8 }]}>Pick Due Date</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 12, marginBottom: 4 }}>
              Scroll to select year, month, and day
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Year</Text>
                <NumberPicker
                  value={tdYear}
                  min={2000}
                  max={2100}
                  onChange={setTdYear}
                  width={70}
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Month</Text>
                <NumberPicker
                  value={tdMonth}
                  min={1}
                  max={12}
                  onChange={setTdMonth}
                  width={50}
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Day</Text>
                <NumberPicker
                  value={tdDay}
                  min={1}
                  max={new Date(tdYear, tdMonth, 0).getDate()}
                  onChange={setTdDay}
                  width={60}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18, justifyContent: 'center' }}>
              <Pressable onPress={() => setShowDueDatePicker(false)} style={styles.cancelBtn}><Text style={{ color: colors.textSecondary }}>Cancel</Text></Pressable>
              <Pressable onPress={() => {
                const m = tdMonth < 10 ? `0${tdMonth}` : tdMonth;
                const d = tdDay < 10 ? `0${tdDay}` : tdDay;
                setDueDate(`${tdYear}-${m}-${d}`);
                setShowDueDatePicker(false);
              }} style={styles.submitBtn}><Text style={styles.submitBtnText}>Set</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>


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
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  priorityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityText: {
    color: colors.textSecondary,
    fontWeight: '800',
  },
  priorityTextActive: {
    color: '#fff',
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
  suggestions: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestionsAbsolute: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 56 : 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 30,
    maxHeight: 220,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  suggestionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerCardModal: {
    maxHeight: 420,
    minHeight: 320,
    width: 340,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 60,
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  dragIndicator: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    alignSelf: 'center',
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pickerBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDate: {
    color: colors.textPrimary,
    fontWeight: '900',
    fontSize: 16,
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

