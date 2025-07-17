
export function getBaseName(name: string): string {
  return name.replace(/\s+\(cópia(?: \d+)?\)$/, '').trim();
}

export function getNextCopyName(baseName: string, existingNames: string[]): string {
  const regex = new RegExp(`^${escapeRegex(baseName)}\\s+\\(cópia(?:\\s(\\d+))?\\)$`, 'i');

  const copyNumbers = existingNames
    .map(name => {
      const match = name.match(regex);
      return match ? parseInt(match[1] || '1', 10) : null;
    })
    .filter(num => num !== null) as number[];

  const nextNumber = copyNumbers.length > 0 ? Math.max(...copyNumbers) + 1 : 1;
  return `${baseName} (cópia${nextNumber > 1 ? ' ' + nextNumber : ''})`;
}

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
