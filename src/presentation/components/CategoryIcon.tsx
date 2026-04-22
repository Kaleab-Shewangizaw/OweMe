import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { TransactionCategory } from '../../domain/models/entities';
import { colors } from '../theme/colors';

type CategoryIconProps = {
  category: TransactionCategory;
  size?: number;
  color?: string;
};

export const CategoryIcon = ({ category, size = 18, color }: CategoryIconProps) => {
  const config = getCategoryConfig(category);
  
  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Feather name={config.icon as any} size={size} color={color || config.color} />
    </View>
  );
};

const getCategoryConfig = (category: TransactionCategory) => {
  switch (category) {
    case 'food':
      return { icon: 'coffee', color: colors.catFood, bgColor: colors.catFood + '20' };
    case 'shopping':
      return { icon: 'shopping-bag', color: colors.catShop, bgColor: colors.catShop + '20' };
    case 'travel':
      return { icon: 'map', color: colors.catTravel, bgColor: colors.catTravel + '20' };
    case 'rent':
      return { icon: 'home', color: colors.catRent, bgColor: colors.catRent + '20' };
    default:
      return { icon: 'layers', color: colors.catOther, bgColor: colors.catOther + '20' };
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
