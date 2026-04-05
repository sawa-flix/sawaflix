// utils/formatCount.ts
export function formatCount(num: string | number | undefined): string {
    if (!num) return '0';

    const n = typeof num === 'string' ? parseInt(num, 10) : num;
    if (isNaN(n)) return '0';

    if (n >= 1_000_000) {
        return (n / 1_000_000).toFixed(1) + 'M';
    }
    if (n >= 1_000) {
        return (n / 1_000).toFixed(1) + 'K';
    }
    return n.toString();
}