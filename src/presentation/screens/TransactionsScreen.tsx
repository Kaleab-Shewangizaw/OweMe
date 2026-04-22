import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { Transaction, TransactionInput, TransactionUpdate } from '../../domain/models/entities';
import { SectionCard } from '../components/SectionCard';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionListItem } from '../components/TransactionListItem';
import { colors } from '../theme/colors';

type TransactionsScreenProps = {
  ledger: LedgerViewModel;
};

export const TransactionsScreen = ({ ledger }: TransactionsScreenProps) => {
  const [editing, setEditing] = useState<Transaction | null>(null);

  const onCreate = async (input: TransactionInput | TransactionUpdate) => {
    await ledger.addTransaction(input as TransactionInput);
  };

  const onUpdate = async (update: TransactionInput | TransactionUpdate) => {
    if (!editing) {
      return;
    }

    await ledger.updateTransaction(editing.id, update as TransactionUpdate);
    setEditing(null);
  };

  const sortedTransactions = useMemo(() => {
    return [...ledger.data.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [ledger.data.transactions]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete transaction', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await ledger.deleteTransaction(id);
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard
        title={editing ? 'Edit transaction' : 'Add transaction'}
        subtitle="Type, person, amount, date, note, and optional due date"
      >
        <TransactionForm
          key={editing?.id ?? 'new-transaction'}
          onSubmit={editing ? onUpdate : onCreate}
          submitLabel={editing ? 'Update Transaction' : 'Add Transaction'}
          initialValue={editing ?? undefined}
          initialPersonName={editing ? (ledger.getPersonById(editing.personId)?.name ?? '') : ''}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </SectionCard>

      <SectionCard
        title="Recent transactions"
        subtitle="Edit, mark settled, or remove records"
      >
        {sortedTransactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet.</Text>
        ) : (
          <View style={styles.list}>
            {sortedTransactions.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
                person={ledger.getPersonById(transaction.personId)}
                onEdit={setEditing}
                onDelete={handleDelete}
                onSettle={ledger.markAsSettled}
              />
            ))}
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 12,
  },
  list: {
    gap: 8,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
