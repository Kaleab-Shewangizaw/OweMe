import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { PersonSummary } from '../../domain/models/entities';
import { PersonListItem } from '../components/PersonListItem';
import { SectionCard } from '../components/SectionCard';
import { TransactionListItem } from '../components/TransactionListItem';
import { colors } from '../theme/colors';

type PeopleScreenProps = {
  ledger: LedgerViewModel;
};

export const PeopleScreen = ({ ledger }: PeopleScreenProps) => {
  const [selected, setSelected] = useState<PersonSummary | null>(null);

  const handleSelectPerson = (personId: string) => {
    const match = ledger.personSummaries.find((summary) => summary.person.id === personId) ?? null;
    setSelected(match);
  };

  const selectedTransactions = useMemo(() => {
    if (!selected) {
      return [];
    }

    return ledger.getTransactionsByPerson(selected.person.id);
  }, [ledger, selected]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title="People" subtitle="Tap a person to view profile and history">
        {ledger.personSummaries.length === 0 ? (
          <Text style={styles.empty}>No people yet. Add a transaction first.</Text>
        ) : (
          <View style={styles.list}>
            {ledger.personSummaries.map((summary) => (
              <PersonListItem key={summary.person.id} summary={summary} onPress={handleSelectPerson} />
            ))}
          </View>
        )}
      </SectionCard>

      {selected ? (
        <SectionCard
          title={selected.person.name}
          subtitle={`Net ${selected.netBalance >= 0 ? '+' : '-'}$${Math.abs(selected.netBalance).toFixed(2)}`}
        >
          {selectedTransactions.length === 0 ? (
            <Text style={styles.empty}>No transactions for this person.</Text>
          ) : (
            <View style={styles.list}>
              {selectedTransactions.map((transaction) => (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                  person={selected.person}
                  onEdit={() => undefined}
                  onDelete={ledger.deleteTransaction}
                  onSettle={ledger.markAsSettled}
                  showEditAction={false}
                />
              ))}
            </View>
          )}
        </SectionCard>
      ) : null}
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
