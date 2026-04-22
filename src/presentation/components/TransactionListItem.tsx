import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Person, Transaction } from '../../domain/models/entities';
import { colors } from '../theme/colors';
import { CategoryIcon } from './CategoryIcon';

type TransactionListItemProps = {
  transaction: Transaction;
  person?: Person;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onSettle: (transactionId: string) => void;
  showEditAction?: boolean;
};

const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;

export const TransactionListItem = ({
  transaction,
  person,
  onEdit,
  onDelete,
  onSettle,
  showEditAction = true,
}: TransactionListItemProps) => {
  const isLent = transaction.type === 'lent';
  const active = transaction.status === 'active';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <CategoryIcon category={transaction.category} size={16} />
        <View style={styles.mainInfo}>
          <Text style={styles.name}>{person?.name ?? 'Unknown'}</Text>
          <Text style={styles.date}>{transaction.date}</Text>
        </View>
        <View style={styles.amountInfo}>
          <Text style={[styles.amount, { color: isLent ? colors.positive : colors.negative }]}>
            {isLent ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Text style={[styles.status, active ? styles.activeStatus : styles.settledStatus]}>
            {transaction.status}
          </Text>
        </View>
      </View>

      {transaction.note ? (
        <View style={styles.noteContainer}>
          <Text style={styles.note} numberOfLines={2}>
            {transaction.note}
          </Text>
        </View>
      ) : null}

      {transaction.dueDate && active ? (
        <View style={styles.dueRow}>
          <Feather name="calendar" size={12} color={colors.warning} />
          <Text style={styles.dueText}>Due {transaction.dueDate}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {active ? (
          <Pressable style={[styles.actionButton, styles.settleButton]} onPress={() => onSettle(transaction.id)}>
            <Feather name="check-circle" size={14} color={colors.primary} />
            <Text style={styles.settleText}>Settle</Text>
          </Pressable>
        ) : null}

        {showEditAction ? (
          <Pressable style={styles.iconButton} onPress={() => onEdit(transaction)}>
            <Feather name="edit-2" size={14} color={colors.textSecondary} />
          </Pressable>
        ) : null}

        <Pressable style={styles.iconButton} onPress={() => onDelete(transaction.id)}>
          <Feather name="trash-2" size={14} color={colors.negative} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  status: {
    fontSize: 11,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  activeStatus: {
    color: colors.warning,
  },
  settledStatus: {
    color: colors.positive,
  },
  noteContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border + '50',
  },
  note: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: colors.warning + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderRadius: 6,
  },
  dueText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  settleButton: {
    marginRight: 'auto',
  },
  settleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

