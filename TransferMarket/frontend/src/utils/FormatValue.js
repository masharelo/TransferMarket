export default function formatValue(value) {
  if (value == null || isNaN(value)) return ' N/A';

  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `${billions.toFixed(1)}b`;
  } else if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(1)}m`;
  } else if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands.toFixed(1)}k`;
  }

  return value.toString();
}
