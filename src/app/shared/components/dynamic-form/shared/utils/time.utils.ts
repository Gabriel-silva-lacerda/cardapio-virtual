export function stringToDate(time: string): Date {
    if (!time) return new Date(0, 0, 0, 0, 0);
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
}

export function formatTime(date: Date | string): string {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const d = new Date(date);
    return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}
