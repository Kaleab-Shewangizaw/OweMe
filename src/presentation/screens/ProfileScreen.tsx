import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Animated } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/colors';
import { LedgerViewModel } from '../../application/hooks/useLedger';

type ProfileScreenProps = {
  onBack: () => void;
  ledger: LedgerViewModel;
};

export const ProfileScreen = ({ onBack, ledger }: ProfileScreenProps) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [biometricEnabled, setBiometricEnabled] = useState(ledger.preferences.biometricsEnabled);

  useEffect(() => {
    if (pinStep === 'current' && currentPin.length === 4) {
      if (currentPin === ledger.preferences.pin) {
        setPinStep('new');
        setCurrentPin('');
      } else {
        alert('Incorrect current PIN');
        setCurrentPin('');
      }
    } else if (pinStep === 'new' && newPin.length === 4) {
      setPinStep('confirm');
    } else if (pinStep === 'confirm' && confirmPin.length === 4) {
      if (newPin === confirmPin) {
        ledger.updatePreferences({ pin: newPin });
        setShowPinModal(false);
        setPinStep('current');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        alert('PIN changed successfully');
      } else {
        alert('PINs do not match');
        setConfirmPin('');
      }
    }
  }, [currentPin, newPin, confirmPin, pinStep, ledger]);

  const handleBiometricToggle = async () => {
    if (!biometricEnabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        alert('Biometric authentication is not available on this device');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        alert('No biometric credentials enrolled. Please set up FaceID or Fingerprint first.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric access',
      });

      if (result.success) {
        await ledger.updatePreferences({ biometricsEnabled: true });
        setBiometricEnabled(true);
      }
    } else {
      await ledger.updatePreferences({ biometricsEnabled: false });
      setBiometricEnabled(false);
    }
  };

  const handlePinPress = (num: string) => {
    const targetPin = pinStep === 'current' ? currentPin : pinStep === 'new' ? newPin : confirmPin;
    const setTargetPin = pinStep === 'current' ? setCurrentPin : pinStep === 'new' ? setNewPin : setConfirmPin;

    if (targetPin.length < 4) {
      setTargetPin(prev => prev + num);
    }
  };

  const handlePinDelete = () => {
    const targetPin = pinStep === 'current' ? currentPin : pinStep === 'new' ? newPin : confirmPin;
    const setTargetPin = pinStep === 'current' ? setCurrentPin : pinStep === 'new' ? setNewPin : setConfirmPin;
    setTargetPin(prev => prev.slice(0, -1));
  };

  const getPinTitle = () => {
    if (pinStep === 'current') return 'Enter Current PIN';
    if (pinStep === 'new') return 'Enter New PIN';
    return 'Confirm New PIN';
  };

  const PinNumpadRow = ({ items }: { items: Array<string | null> }) => (
    <View style={styles.pinNumpadRow}>
      {items.map((item, i) => {
        if (item === null) return <View key={i} style={styles.pinNumBtnEmpty} />;
        if (item === 'delete') {
          return (
            <Pressable key={i} style={styles.pinNumBtn} onPress={handlePinDelete}>
              <Feather name="delete" size={24} color={colors.textSecondary} />
            </Pressable>
          );
        }
        return (
          <Pressable key={i} style={styles.pinNumBtn} onPress={() => handlePinPress(item)}>
            <Text style={styles.pinNumText}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={48} color={colors.primary} />
            </View>
            <Pressable style={styles.editAvatarBtn}>
              <Feather name="camera" size={16} color="#FFF" />
            </Pressable>
          </View>
          {/* <Text style={styles.userName}>Kaleab Shewangizaw</Text>
          <Text style={styles.userEmail}>kaleab.s@example.com</Text> */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Security</Text>
          <View style={styles.options}>
            <MenuOption icon="lock" label="Change PIN" sublabel="Update your 4-digit security code" onPress={() => setShowPinModal(true)} />
            <MenuOption
              icon="shield"
              label="Biometric Access"
              sublabel="Enable FaceID or Fingerprint"
              hasSwitch
              active={biometricEnabled}
              onToggle={handleBiometricToggle}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.options}>
            <MenuOption icon="moon" label="Dark Theme" sublabel="Optimized for late night tracking" hasSwitch active />
            <MenuOption icon="bell" label="Reminders" sublabel="Get notified about upcoming dues" hasSwitch active />
            <MenuOption icon="database" label="Backup Data" sublabel="Sync your data to the cloud" comingSoon />
          </View>
        </View>

        <Pressable style={styles.logoutBtn}>
          <Feather name="log-out" size={18} color={colors.negative} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pinModal}>
            <Text style={styles.pinModalTitle}>{getPinTitle()}</Text>
            <View style={styles.pinDots}>
              {[0, 1, 2, 3].map(i => {
                const targetPin = pinStep === 'current' ? currentPin : pinStep === 'new' ? newPin : confirmPin;
                return (
                  <View
                    key={i}
                    style={[
                      styles.pinDot,
                      targetPin.length > i && { backgroundColor: colors.primary, width: 16, height: 16 }
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.pinNumpad}>
              <PinNumpadRow items={['1', '2', '3']} />
              <PinNumpadRow items={['4', '5', '6']} />
              <PinNumpadRow items={['7', '8', '9']} />
              <PinNumpadRow items={[null, '0', 'delete']} />
            </View>
            <Pressable style={styles.pinCancelBtn} onPress={() => {
              setShowPinModal(false);
              setPinStep('current');
              setCurrentPin('');
              setNewPin('');
              setConfirmPin('');
            }}>
              <Text style={styles.pinCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const MenuOption = ({ icon, label, sublabel, hasSwitch, active, comingSoon, onPress, onToggle }: any) => (
  <Pressable style={[styles.optionRow, comingSoon && { opacity: 0.5 }]} onPress={onPress}>
    <View style={[styles.optionIcon, { backgroundColor: colors.surface }]}>
      <Feather name={icon} size={18} color={colors.primary} />
    </View>
    <View style={styles.optionInfo}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.optionSublabel}>{sublabel}</Text>
      {comingSoon && (
        <Text style={styles.comingSoon}>Coming Next Version</Text>
      )}
    </View>
    {hasSwitch ? (
      <Pressable onPress={onToggle} style={[styles.switch, active && styles.switchActive]}>
        <View style={[styles.switchThumb, active && styles.switchThumbActive]} />
      </Pressable>
    ) : (
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    )}
  </Pressable>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    paddingBottom: 60,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  options: {
    gap: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  optionSublabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  comingSoon: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.primary + '30',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textMuted,
  },
  switchThumbActive: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.negative + '30',
  },
  logoutText: {
    color: colors.negative,
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinModal: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  pinModalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 24,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  pinNumpad: {
    marginBottom: 24,
    gap: 16,
    alignItems: 'center',
  },
  pinNumpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
  },
  pinNumBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinNumBtnEmpty: {
    width: 64,
    height: 64,
  },
  pinNumText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  pinCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  pinCancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
