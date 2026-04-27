import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { colors } from '../theme/colors';

type LockScreenProps = {
  mode: 'setup' | 'unlock';
  storedPin?: string;
  onSuccess: (pin: string) => void;
};

export const LockScreen = ({ mode, storedPin, onSuccess }: LockScreenProps) => {
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string | null>(null);
  const shakeAnim = new Animated.Value(0);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (mode === 'setup') {
        if (!confirmPin) {
          setConfirmPin(pin);
          setPin('');
        } else {
          if (pin === confirmPin) {
            onSuccess(pin);
          } else {
            triggerShake();
            setConfirmPin(null);
          }
        }
      } else {
        if (pin === storedPin) {
          onSuccess(pin);
        } else {
          triggerShake();
        }
      }
    }
  }, [pin]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => setPin(''));
  };

  const getTitle = () => {
    if (mode === 'unlock') return 'Secure Access';
    return confirmPin ? 'Confirm PIN' : 'Create PIN';
  };

  const getSubtitle = () => {
    if (mode === 'unlock') return 'Enter your PIN to continue';
    return confirmPin ? 'Enter your PIN again' : 'Set a 4-digit code for your ledger';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Feather name={mode === 'unlock' ? "lock" : "shield"} size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>


      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map(i => (
          <View 
            key={i} 
            style={[
              styles.dot, 
              pin.length > i && { backgroundColor: colors.primary, width: 16, height: 16 }
            ]} 
          />
        ))}
      </Animated.View>

      <View style={styles.numpad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((item, i) => {
          if (item === '') return <View key={i} style={styles.numBtnEmpty} />;
          if (item === 'delete') {
            return (
              <Pressable key={i} style={styles.numBtn} onPress={handleDelete}>
                <Feather name="delete" size={24} color={colors.textSecondary} />
              </Pressable>
            );
          }
          return (
            <Pressable key={i} style={styles.numBtn} onPress={() => handlePress(item)}>
              <Text style={styles.numText}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.forgotBtn, { opacity: 0.5 }]}>
        <Text style={styles.forgotText}>Forgot PIN? <Text style={styles.comingSoon}>Coming Next Version</Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  numBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  numBtnEmpty: {
    width: 72,
    height: 72,
  },
  numText: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  forgotBtn: {
    alignSelf: 'center',
  },
  forgotText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  comingSoon: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
  },
});
