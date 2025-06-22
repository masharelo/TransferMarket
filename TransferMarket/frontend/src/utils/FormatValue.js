export default function formatValue(value) {
  if (value == null || isNaN(value)) return '???';

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${formatted}m`;
  } else if (value >= 1_000) {
    const thousands = value / 1_000;
    const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(0);
    return `${formatted}k`;
  }

  return value.toString();
}
