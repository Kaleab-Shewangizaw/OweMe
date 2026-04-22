import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { Transaction, TransactionInput, TransactionUpdate } from '../../domain/models/entities';
import { SectionCard } from '../components/SectionCard';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionListItem } from '../components/TransactionListItem';
import { colors } from '../theme/colors';

type TransactionsScreenProps = {
  ledger: LedgerViewModel;
  initialMode?: ViewMode;
};

type ViewMode = 'history' | 'add';
type SortField = 'date' | 'amount' | 'person';
type SortOrder = 'asc' | 'desc';

export const TransactionsScreen = ({ ledger, initialMode = 'history' }: TransactionsScreenProps) => {
  const [mode, setMode] = useState<ViewMode>(initialMode);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const onCreate = async (input: TransactionInput | TransactionUpdate) => {
    await ledger.addTransaction(input as TransactionInput);
    setMode('history');
  };

  const onUpdate = async (update: TransactionInput | TransactionUpdate) => {
    if (!editing) return;
    await ledger.updateTransaction(editing.id, update as TransactionUpdate);
    setEditing(null);
    setMode('history');
  };

  const filteredTransactions = useMemo(() => {
    let list = [...ledger.data.transactions];
    
    // Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => {
        const person = ledger.getPersonById(t.personId);
        return person?.name.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q);
      });
    }

    // Sort
    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'person') {
        const nameA = ledger.getPersonById(a.personId)?.name || '';
        const nameB = ledger.getPersonById(b.personId)?.name || '';
        comparison = nameA.localeCompare(nameB);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [ledger, search, sortField, sortOrder]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record?', 'This will permanently remove this entry.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => ledger.deleteTransaction(id) },
    ]);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, mode === 'history' && styles.activeTab]}
          onPress={() => { setMode('history'); setEditing(null); }}
        >
          <Text style={[styles.tabText, mode === 'history' && styles.activeTabText]}>Activity</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, (mode === 'add' || editing) && styles.activeTab]}
          onPress={() => setMode('add')}
        >
          <Text style={[styles.tabText, (mode === 'add' || editing) && styles.activeTabText]}>
            {editing ? 'Editing' : 'New Entry'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mode === 'add' || editing ? (
          <SectionCard
            title={editing ? 'Edit Record' : 'Create Entry'}
            subtitle="Record a new loan or repayment"
          >
            <TransactionForm
              key={editing?.id ?? 'new'}
              onSubmit={editing ? onUpdate : onCreate}
              submitLabel={editing ? 'Save Changes' : 'Record Transaction'}
              initialValue={editing ?? undefined}
              initialPersonName={editing ? ledger.getPersonById(editing.personId)?.name : ''}
              onCancel={() => { setEditing(null); setMode('history'); }}
            />
          </SectionCard>
        ) : (
          <>
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Feather name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Seach history..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                />
              </View>
            </View>

            <View style={styles.sortBar}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <Pressable onPress={() => toggleSort('date')} style={[styles.sortButton, sortField === 'date' && styles.activeSort]}>
                <Text style={[styles.sortButtonText, sortField === 'date' && styles.activeSortText]}>Date</Text>
                {sortField === 'date' && <Feather name={sortOrder === 'asc' ? "chevron-up" : "chevron-down"} size={12} color={colors.primary} />}
              </Pressable>
              <Pressable onPress={() => toggleSort('amount')} style={[styles.sortButton, sortField === 'amount' && styles.activeSort]}>
                <Text style={[styles.sortButtonText, sortField === 'amount' && styles.activeSortText]}>Amount</Text>
                {sortField === 'amount' && <Feather name={sortOrder === 'asc' ? "chevron-up" : "chevron-down"} size={12} color={colors.primary} />}
              </Pressable>
              <Pressable onPress={() => toggleSort('person')} style={[styles.sortButton, sortField === 'person' && styles.activeSort]}>
                <Text style={[styles.sortButtonText, sortField === 'person' && styles.activeSortText]}>Contact</Text>
                {sortField === 'person' && <Feather name={sortOrder === 'asc' ? "chevron-up" : "chevron-down"} size={12} color={colors.primary} />}
              </Pressable>
            </View>

            <SectionCard title="Recent Activity" subtitle={`${filteredTransactions.length} results found`}>
              {filteredTransactions.length === 0 ? (
                <Text style={styles.empty}>No matches found.</Text>
              ) : (
                <View style={styles.list}>
                  {filteredTransactions.map((transaction) => (
                    <TransactionListItem
                      key={transaction.id}
                      transaction={transaction}
                      person={ledger.getPersonById(transaction.personId)}
                      onEdit={(t) => { setEditing(t); setMode('add'); }}
                      onDelete={handleDelete}
                      onSettle={ledger.markAsSettled}
                    />
                  ))}
                </View>
              )}
            </SectionCard>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.surfaceAlt,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.primary,
  },
  searchRow: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 12,
    fontSize: 14,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  sortLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  activeSort: {
    borderColor: colors.primary + '50',
    backgroundColor: colors.primary + '10',
  },
  sortButtonText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeSortText: {
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 20,
  },

  list: {
    gap: 8,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});

