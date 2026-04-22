import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
  const [search, setSearch] = useState('');

  const filteredPeople = useMemo(() => {
    let list = [...ledger.personSummaries];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.person.name.toLowerCase().includes(q));
    }
    return list;
  }, [ledger.personSummaries, search]);

  const handleSelectPerson = (personId: string) => {
    const match = ledger.personSummaries.find((summary) => summary.person.id === personId) ?? null;
    setSelected(match);
  };

  const selectedTransactions = useMemo(() => {
    if (!selected) return [];
    return ledger.getTransactionsByPerson(selected.person.id);
  }, [ledger, selected]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Find a contact..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionCard title="Contacts" subtitle="Tap to view history and settlement">
          {filteredPeople.length === 0 ? (
            <Text style={styles.empty}>No contacts found.</Text>
          ) : (
            <View style={styles.list}>
              {filteredPeople.map((summary) => (
                <PersonListItem key={summary.person.id} summary={summary} onPress={handleSelectPerson} />
              ))}
            </View>
          )}
        </SectionCard>

        {selected ? (
          <SectionCard
            title={selected.person.name}
            subtitle={`Records for this contact`}
          >
            {selectedTransactions.length === 0 ? (
              <Text style={styles.empty}>No entries yet.</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 12,
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  list: {
    gap: 4,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

