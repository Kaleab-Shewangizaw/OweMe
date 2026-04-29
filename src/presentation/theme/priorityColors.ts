import type { TransactionPriority } from '../../domain/models/entities';

export const priorityColors: Record<TransactionPriority, { bg: string; text: string }> = {
  low:    { bg: '#38BDF8', text: '#0C4A6E' }, // sky blue
  medium: { bg: '#FACC15', text: '#92400E' }, // yellow
  high:   { bg: '#FB7185', text: '#991B1B' }, // rose
  urgent: { bg: '#F43F5E', text: '#fff' },    // red
};
