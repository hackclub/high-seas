import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function orThrow(message?: string): never {
  throw new Error(message ?? 'An error occurred.')
}
