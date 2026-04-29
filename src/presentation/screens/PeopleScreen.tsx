import { Feather } from '@expo/vector-icons';
import { useMemo, useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Modal, Pressable } from 'react-native';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);
  const [settleModal, setSettleModal] = useState<{ open: boolean, transaction: any, amount: string, error: string }>({ open: false, transaction: null, amount: '', error: '' });

  const filteredPeople = useMemo(() => {
    let list = [...ledger.personSummaries];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.person.name.toLowerCase().includes(q));
    }
    return list;
  }, [ledger.personSummaries, search]);

  const handleSelectPerson = (personId: string) => {
    const match = ledger.personSummaries.find((summary) => summary.person.id === personId);
    setSelectedId(personId);
    setShowRecordsModal(true);
    setIsEditingName(false);
    setEditingName(match?.person.name ?? '');
    setUpdateFeedback(null);
  };

  const handleSettle = (transaction: any) => {
    setSettleModal({ open: true, transaction, amount: '', error: '' });
  };

  const handleSettleAmount = async () => {
    if (!settleModal.transaction) return;
    const entered = parseFloat(settleModal.amount);
    if (isNaN(entered) || entered <= 0) {
      setSettleModal(m => ({ ...m, error: 'Enter a valid amount.' }));
      return;
    }
    if (entered > settleModal.transaction.amount) {
      setSettleModal(m => ({ ...m, error: 'Amount exceeds remaining balance.' }));
      return;
    }
    if (entered === settleModal.transaction.amount) {
      await ledger.markAsSettled(settleModal.transaction.id);
      setSettleModal({ open: false, transaction: null, amount: '', error: '' });
      return;
    }
    // Partial settlement: reduce amount, add a new transaction for settled part
    await ledger.updateTransaction(settleModal.transaction.id, { amount: settleModal.transaction.amount - entered });
    await ledger.addTransaction({
      type: settleModal.transaction.type,
      category: settleModal.transaction.category,
      personName: ledger.getPersonById(settleModal.transaction.personId)?.name || '',
      amount: entered,
      date: new Date().toISOString().split('T')[0],
      note: 'Partial settlement',
    });
    setSettleModal({ open: false, transaction: null, amount: '', error: '' });
  };

  const handleDeletePerson = (personId: string, name: string) => {
    Alert.alert(
      'Delete Contact?',
      `This will permanently remove ${name} and all their transaction history. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive', 
          onPress: async () => {
            await ledger.deletePerson(personId);
            setShowRecordsModal(false);
            setSelected(null);
          } 
        },
      ]
    );
  };

  const selectedSummary = useMemo(() => {
    if (!selectedId) return null;
    return ledger.personSummaries.find(p => p.person.id === selectedId) ?? null;
  }, [ledger.personSummaries, selectedId]);

  const selectedTransactions = useMemo(() => {
    if (!selectedId) return [];
    return ledger.getTransactionsByPerson(selectedId);
  }, [ledger, selectedId]);

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
        <Modal visible={showRecordsModal} transparent animationType="slide" onRequestClose={() => { setShowRecordsModal(false); setSelectedId(null); }}>
          <View style={styles.modalOverlay}>
            <View style={styles.recordModalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowRecordsModal(false)} style={styles.backButton}>
                  <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                  {isEditingName ? (
                    <View style={styles.editNameContainer}>
                      <TextInput
                        value={editingName}
                        onChangeText={setEditingName}
                        placeholder="Contact name"
                        placeholderTextColor={colors.textMuted}
                        style={styles.editNameInput}
                        autoFocus
                      />
                    </View>
                  ) : (
                    <>
                      <Text style={styles.modalTitle}>{selectedSummary?.person.name}</Text>
                      {updateFeedback ? (
                        <Text style={[styles.modalSubtitle, { color: colors.primary }]}>{updateFeedback}</Text>
                      ) : (
                        <Text style={styles.modalSubtitle}>Contact Activity</Text>
                      )}
                    </>
                  )}
                </View>
                <View style={styles.headerActions}>
                  {selectedSummary ? (
                    isEditingName ? (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable 
                          onPress={() => setIsEditingName(false)} 
                          style={[styles.actionButton, { backgroundColor: colors.surfaceAlt }]}
                        >
                          <Feather name="x" size={18} color={colors.textSecondary} />
                        </Pressable>
                        <Pressable 
                          onPress={() => {
                            const newName = editingName.trim();
                            if (!newName) { Alert.alert('Invalid name', 'Name cannot be empty.'); return; }

                            // check for existing person with same name
                            const existing = ledger.data.persons.find(p => p.name.toLowerCase() === newName.toLowerCase());
                            if (existing && existing.id !== selectedSummary.person.id) {
                              Alert.alert('Combine contact?', `Combine records with ${existing.name}?`, [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Combine', onPress: async () => {
                                    await ledger.mergePersons(existing.id, selectedSummary.person.id);
                                    setShowRecordsModal(false);
                                    setSelectedId(null);
                                  }
                                }
                              ]);
                            } else {
                              ledger.updatePersonName(selectedSummary.person.id, newName).then(() => {
                                setIsEditingName(false);
                                setUpdateFeedback('Name updated!');
                                setTimeout(() => setUpdateFeedback(null), 3000);
                              });
                            }
                          }} 
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        >
                          <Feather name="check" size={18} color="#FFF" />
                        </Pressable>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable 
                          onPress={() => handleDeletePerson(selectedSummary.person.id, selectedSummary.person.name)} 
                          style={[styles.actionButton, { backgroundColor: colors.negative + '15' }]}
                        >
                          <Feather name="trash-2" size={18} color={colors.negative} />
                        </Pressable>
                        <Pressable 
                          onPress={() => { setIsEditingName(true); setEditingName(selectedSummary.person.name); }} 
                          style={[styles.actionButton, { backgroundColor: colors.surfaceAlt }]}
                        >
                          <Feather name="edit-3" size={18} color={colors.primary} />
                        </Pressable>
                      </View>
                    )
                  ) : null}
                </View>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                {selectedTransactions.length === 0 ? (
                  <View style={styles.modalEmptyContainer}>
                    <Feather name="list" size={48} color={colors.surfaceAlt} style={{ marginBottom: 16 }} />
                    <Text style={styles.empty}>No entries yet.</Text>
                    <Text style={styles.comingSoon}>Settlement history & analytics coming soon</Text>
                  </View>
                ) : (
                  <View style={styles.list}>
                    {selectedTransactions.map((transaction) => (
                      <TransactionListItem
                        key={transaction.id}
                        transaction={transaction}
                        person={selectedSummary?.person}
                        onEdit={() => undefined}
                        onDelete={ledger.deleteTransaction}
                        onSettle={() => handleSettle(transaction)}
                        showEditAction={false}
                      />
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal visible={settleModal.open} transparent animationType="fade" onRequestClose={() => setSettleModal({ open: false, transaction: null, amount: '', error: '' })}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 16 }}>Settle Amount</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>How much are they settling?</Text>
              <TextInput
                value={settleModal.amount}
                onChangeText={val => setSettleModal(m => ({ ...m, amount: val, error: '' }))}
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.textPrimary, marginBottom: 8 }}
              />
              <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Remaining: ${settleModal.transaction?.amount?.toFixed(2) ?? ''}</Text>
              {settleModal.error ? <Text style={{ color: colors.negative, marginBottom: 8 }}>{settleModal.error}</Text> : null}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <Pressable onPress={() => setSettleModal({ open: false, transaction: null, amount: '', error: '' })} style={{ paddingVertical: 10, paddingHorizontal: 18 }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSettleAmount} style={{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Settle</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  comingSoon: {
    color: colors.warning,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  recordModalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '90%',
    paddingTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 180,
  },
  editNameInput: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 6,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  modalEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
});

