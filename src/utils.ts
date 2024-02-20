export function fromVoidStrangerLetter (nb: number): string | null {
  if (nb > 0 && nb <= 26) {
    return String.fromCharCode(nb + "A".charCodeAt(0) - 1);
  } else {
    return null;
  }
}

export function toVoidStrangerLetter(letter: string): number | null {
  if (letter.charCodeAt(0) >= 65 && letter.charCodeAt(0) < 65 + 26) {
    return letter.charCodeAt(0) - "A".charCodeAt(0) + 1;
  } else {
    return null;
  }
}

export function chunks<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}

export function isOrdered<T>(arr: T[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i+1]) {
      return false;
    }
  }
  return true;
}