import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
  });

  it('initializes with system if no preference in localStorage', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('system');
    expect(window.localStorage.getItem('travel-prep-theme')).toBe('system');
  });

  it('initializes with light if set in localStorage', () => {
    window.localStorage.setItem('travel-prep-theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('falls back to system for invalid localStorage values', () => {
    window.localStorage.setItem('travel-prep-theme', 'invalid');
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('system');
  });

  it('updates theme to dark', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current[1]('dark');
    });
    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('travel-prep-theme')).toBe('dark');
  });

  it('handles system preference correctly when matchMedia matches dark', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
