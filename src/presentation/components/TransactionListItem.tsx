import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Person, Transaction } from '../../domain/models/entities';
import { colors } from '../theme/colors';

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
      <View style={styles.header}>
        <Text style={styles.name}>{person?.name ?? 'Unknown Person'}</Text>
        <Text style={[styles.amount, { color: isLent ? colors.positive : colors.negative }]}>
          {isLent ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>

      <Text style={styles.meta}>Date: {transaction.date}</Text>
      {transaction.dueDate ? <Text style={styles.meta}>Due: {transaction.dueDate}</Text> : null}
      {transaction.note ? <Text style={styles.note}>{transaction.note}</Text> : null}

      <View style={styles.statusRow}>
        <Text style={[styles.badge, active ? styles.activeBadge : styles.settledBadge]}>
          {transaction.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.actions}>
        {showEditAction ? (
          <Pressable style={styles.actionButton} onPress={() => onEdit(transaction)}>
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
        ) : null}

        {active ? (
          <Pressable style={styles.actionButton} onPress={() => onSettle(transaction.id)}>
            <Text style={styles.actionText}>Settle</Text>
          </Pressable>
        ) : null}

        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(transaction.id)}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  note: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  activeBadge: {
    backgroundColor: '#2A3242',
    color: colors.warning,
  },
  settledBadge: {
    backgroundColor: '#1E382A',
    color: colors.positive,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    borderColor: '#62333A',
  },
  deleteText: {
    color: colors.negative,
  },
});
