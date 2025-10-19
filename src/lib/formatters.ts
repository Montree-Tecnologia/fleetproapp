/**
 * Utility functions for formatting and parsing numeric inputs
 */

/**
 * Formats a number as Brazilian currency (R$ 1.234,56)
 */
export const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
  
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Parses a formatted currency string to number
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/\D/g, '');
  return parseFloat(cleaned) / 100 || 0;
};

/**
 * Formats a number with 2 decimal places and thousands separator (1.234,56)
 * Supports negative numbers
 */
export const formatDecimal = (value: string | number): string => {
  // Handle negative sign
  const isNegative = typeof value === 'string' ? value.includes('-') : value < 0;
  const cleanedValue = typeof value === 'string' ? value.replace(/[^\d]/g, '') : Math.abs(value).toString();
  const numValue = parseFloat(cleanedValue) / 100;
  
  if (isNaN(numValue)) return '';
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
  
  return isNegative ? `-${formatted}` : formatted;
};

/**
 * Parses a formatted decimal string to number
 * Supports negative numbers
 */
export const parseDecimal = (value: string): number => {
  const isNegative = value.includes('-');
  const cleaned = value.replace(/[^\d]/g, '');
  const numValue = parseFloat(cleaned) / 100 || 0;
  return isNegative ? -numValue : numValue;
};

/**
 * Formats an integer with thousands separator (1.234)
 */
export const formatInteger = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
  
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

/**
 * Parses a formatted integer string to number
 */
export const parseInteger = (value: string): number => {
  const cleaned = value.replace(/\D/g, '');
  return parseInt(cleaned) || 0;
};

/**
 * Formats a year (only 4 digits, no formatting)
 */
export const formatYear = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.slice(0, 4);
};

/**
 * Parses a year string to number
 */
export const parseYear = (value: string): number => {
  return parseInt(value) || 0;
};

/**
 * Handles currency input change for react-hook-form
 */
export const handleCurrencyInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number) => void
) => {
  const formatted = formatCurrency(e.target.value);
  e.target.value = formatted;
  onChange(parseCurrency(formatted));
};

/**
 * Handles decimal input change for react-hook-form
 * Supports negative numbers
 */
export const handleDecimalInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number) => void
) => {
  const formatted = formatDecimal(e.target.value);
  e.target.value = formatted;
  onChange(parseDecimal(formatted));
};

/**
 * Handles integer input change for react-hook-form
 */
export const handleIntegerInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number) => void
) => {
  const formatted = formatInteger(e.target.value);
  e.target.value = formatted;
  onChange(parseInteger(formatted));
};

/**
 * Handles year input change for react-hook-form
 */
export const handleYearInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number) => void
) => {
  const formatted = formatYear(e.target.value);
  e.target.value = formatted;
  onChange(parseYear(formatted));
};

/**
 * Formats a decimal number for display (allows direct input like 500.5 -> 500,50)
 */
export const formatDirectDecimal = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Parses direct decimal input (user types 500,5 -> returns 500.5)
 */
export const parseDirectDecimal = (value: string): number => {
  if (!value) return 0;
  // Replace comma with dot and remove any other non-numeric characters except dot
  const cleaned = value.replace(',', '.').replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Handles direct decimal input (no division by 100)
 */
export const handleDirectDecimalInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number) => void
) => {
  const parsed = parseDirectDecimal(e.target.value);
  const formatted = formatDirectDecimal(parsed);
  e.target.value = formatted;
  onChange(parsed);
};
