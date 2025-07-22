export function removeStopWords(text: string): string {
  const stopWords = ['the', 'is', 'in', 'at', 'which', 'on', 'a', 'an', 'and', 'to', 'of'];
  return text
    .split(' ')
    .filter((word) => !stopWords.includes(word.toLowerCase()))
    .join(' ');
}
