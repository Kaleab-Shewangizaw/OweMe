import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Person, Transaction } from '../../domain/models/entities';
import { colors } from '../theme/colors';
import { priorityColors } from '../theme/priorityColors';
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
        {transaction.priority ? (
          <View style={{
            backgroundColor: priorityColors[transaction.priority]?.bg,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginRight: 8,
            alignSelf: 'flex-start',
          }}>
            <Text style={{
              color: priorityColors[transaction.priority]?.text,
              fontWeight: '900',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>{transaction.priority}</Text>
          </View>
        ) : null}
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
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  status: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 4,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeStatus: {
    color: colors.warning,
  },
  settledStatus: {
    color: colors.positive,
  },
  noteContainer: {
    marginTop: 4,
    paddingLeft: 32,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginLeft: 32,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  dueText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingLeft: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  settleButton: {
    marginRight: 'auto',
  },
  settleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});


