import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

// Initialize zxcvbn dictionaries
const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
};
zxcvbnOptions.setOptions(options);

// Helper to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer) {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Checks HIBP API using k-anonymity (SHA-1 prefix)
 */
export async function checkPwnedPassword(password: string): Promise<number> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hash = bufferToHex(hashBuffer);

    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return 0;

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return parseInt(count.trim(), 10);
      }
    }
    return 0;
  } catch (err) {
    console.error("HIBP Error", err);
    return 0; // Silently fail if offline or API blocked
  }
}

export function evaluateZxcvbn(password: string) {
  return zxcvbn(password);
}

export function generateAiSuggestion(issues: string[], score: number): string {
  const i = issues.join(' ').toLowerCase();
  
  const isReused = i.includes('reused');
  const isBreached = i.includes('breach');
  const isWeak = i.includes('common') || i.includes('dictionary') || i.includes('short') || i.includes('length') || i.includes('pattern') || i.includes('keyboard');

  if (score >= 4) {
    return 'Strong password! Rotate annually';
  }

  if (isReused) {
    return 'Reusing passwords means one breach exposes all accounts — use a unique password per site.';
  }
  if (isBreached && isWeak) {
    return 'Found in breaches and easily guessed — replace immediately with a random 16+ character password.';
  }
  if (isBreached) {
    return 'Found in data breaches — replace immediately with a unique 16+ character password.';
  }
  if (isWeak) {
    return 'Common passwords are cracked instantly — use 4 random unrelated words with numbers and symbols.';
  }
  
  return 'Strong password! Rotate annually';
}