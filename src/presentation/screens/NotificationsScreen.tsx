import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

type NotificationsScreenProps = {
  onBack: () => void;
};

export const NotificationsScreen = ({ onBack }: NotificationsScreenProps) => {
  const notifications = [
    { id: '1', title: 'Notifications', message: 'coming soon', time: '', icon: 'clock', color: colors.warning },
    
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={[styles.clearBtn, { opacity: 0.5 }]}>
          <Text style={styles.clearText}>Clear All <Text style={styles.comingSoon}>Coming Next Version</Text></Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="bell-off" size={36} color={colors.border} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id} style={styles.notifRow}>
              <View style={[styles.iconBox, { backgroundColor: notif.color + '15' }]}>
                <Feather name={notif.icon as any} size={16} color={notif.color} />
              </View>
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifMessage}>{notif.message}</Text>
              </View>
            </View>
          ))
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  clearBtn: {
    paddingHorizontal: 8,
  },
  clearText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  notifTime: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  notifMessage: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  empty: {
    paddingTop: 70,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoon: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
  },
});
