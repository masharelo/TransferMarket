export default function formatTotalValue(value) {
  if (value == null || isNaN(value)) return '???';

  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `${billions.toFixed(2)} billion`;
  } else if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(2)} million`;
  } else if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands.toFixed(2)} thousand`;
  }

  return value.toString();
}