import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Platform, Pressable } from 'react-native';
import { colors } from '../theme/colors';

interface NumberPickerProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  width?: number;
}

const ITEM_HEIGHT = 42;
const VISIBLE_ITEMS = 3;

export const NumberPicker = ({ value, min, max, onChange, width = 70 }: NumberPickerProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const isInitialScroll = useRef(true);

  const numbers: number[] = [];
  for (let i = min; i <= max; i++) numbers.push(i);

  // Padding items to allow first and last items to be centered
  const displayNumbers = [null, ...numbers, null];

  useEffect(() => {
    // Scroll to the current value on mount or when min/max changes
    const index = numbers.indexOf(value);
    if (index !== -1) {
      const targetY = index * ITEM_HEIGHT;
      // Use a small delay to ensure the ScrollView is laid out
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: targetY, animated: !isInitialScroll.current });
        isInitialScroll.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [value, min, max]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const newValue = numbers[index];

    if (newValue !== undefined && newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <View style={[styles.container, { width, height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
      {/* Selection Indicator */}
      <View style={styles.indicator} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {displayNumbers.map((n, i) => (
          <Pressable
            key={i}
            onPress={() => n !== null && onChange(n)}
            style={styles.item}
          >
            {n !== null ? (
              <Text style={[
                styles.text,
                n === value ? styles.selectedText : styles.unselectedText
              ]}>
                {n < 10 ? `0${n}` : n}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>

      {/* Fade Overlays */}
      <View style={[styles.fade, styles.fadeTop]} pointerEvents="none" />
      <View style={[styles.fade, styles.fadeBottom]} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  unselectedText: {
    color: colors.textMuted,
    fontSize: 16,
    opacity: 0.6,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
  },
  fadeTop: {
    top: 0,
    backgroundColor: Platform.OS === 'web' ? 'rgba(8,10,14,0.7)' : colors.surfaceDeep + 'B3', // Approx 70% opacity
  },
  fadeBottom: {
    bottom: 0,
    backgroundColor: Platform.OS === 'web' ? 'rgba(8,10,14,0.7)' : colors.surfaceDeep + 'B3',
  },
});
