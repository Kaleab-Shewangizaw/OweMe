
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';

type InsightsScreenProps = {
  ledger: LedgerViewModel;
};

export const InsightsScreen = ({ ledger }: InsightsScreenProps) => {
  const { frequentBorrowers, upcomingDueTransactions, overdueTransactions } = ledger.insights;
  const [settleModal, setSettleModal] = useState<{ open: boolean, transaction: any, amount: string, error: string }>({ open: false, transaction: null, amount: '', error: '' });

  const maxBorrowCount = Math.max(...frequentBorrowers.map(b => b.transactionCount), 1);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard
        title="Top Contacts"
        subtitle="People with the most interactions"
      >
        {frequentBorrowers.length === 0 ? (
          <Text style={styles.empty}>Start adding records to see trends.</Text>
        ) : (
          <View style={styles.chart}>
            {frequentBorrowers.map((item) => (
              <View key={item.person.id} style={styles.barRow}>
                <Text style={styles.barLabel}>{item.person.name}</Text>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { width: `${(item.transactionCount / maxBorrowCount) * 100}%` }
                    ]} 
                  />
                  <Text style={styles.barValue}>{item.transactionCount}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Upcoming Dues" subtitle="Expiring within 7 days">
        {upcomingDueTransactions.length === 0 ? (
          <Text style={styles.empty}>All caught up!</Text>
        ) : (
          <View style={styles.list}>
            {upcomingDueTransactions.map((transaction) => (
              <Pressable 
                key={transaction.id} 
                style={({ pressed }) => [styles.itemRow, pressed && { backgroundColor: colors.surfaceAlt }]}
                onPress={() => handleSettle(transaction)}
              >
                <View style={styles.dot} />
                <Text style={styles.rowText}>
                  {ledger.getPersonById(transaction.personId)?.name} - ${transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.dateText}>{transaction.dueDate}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Overdue" subtitle="Action required immediately">
        {overdueTransactions.length === 0 ? (
          <Text style={styles.empty}>None found. Great job!</Text>
        ) : (
          <View style={styles.list}>
            {overdueTransactions.map((transaction) => (
              <Pressable 
                key={transaction.id} 
                style={({ pressed }) => [styles.itemRow, styles.overdueRow, pressed && { backgroundColor: colors.surfaceAlt }]}
                onPress={() => handleSettle(transaction)}
              >
                <View style={[styles.dot, { backgroundColor: colors.negative }]} />
                <Text style={[styles.rowText, { color: colors.negative }]}>
                  {ledger.getPersonById(transaction.personId)?.name} - ${transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.dateText}>Expired</Text>
              </Pressable>
            ))}
          </View>
        )}
      </SectionCard>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 10,
  },
  chart: {
    gap: 20,
    marginTop: 8,
  },
  barRow: {
    gap: 10,
  },
  barLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bar: {
    height: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  barValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    gap: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  overdueRow: {
    borderBottomColor: colors.negative + '20',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  rowText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '500',
  },
});


