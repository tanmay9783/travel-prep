import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeSelector from './ThemeSelector';

describe('ThemeSelector', () => {
  it('renders correctly with current theme', () => {
    const setTheme = vi.fn();
    render(<ThemeSelector theme="light" setTheme={setTheme} />);
    const select = screen.getByLabelText(/select application theme/i);
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('light');
  });

  it('calls setTheme on change', () => {
    const setTheme = vi.fn();
    render(<ThemeSelector theme="system" setTheme={setTheme} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'dark' } });
    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
