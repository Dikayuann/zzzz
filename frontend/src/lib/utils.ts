import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Helper cn() menggabungkan class Tailwind CSS secara kondisional
 * dan mengatasi konflik class (misal: 'px-2 px-4' akan otomatis diselesaikan menjadi 'px-4').
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
