/*
 * TypeScript loads the package’s matcher type augmentation globally,
 * so all test files can type-check things like:
 * - toBeInTheDocument()
 * - toBeDisabled()
 * - toHaveAttribute()
 */
import '@testing-library/jest-dom';
