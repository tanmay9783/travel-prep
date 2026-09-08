import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    expect(result.current[0]).toEqual([]);
  });

  it('should load existing valid localStorage data', () => {
    localStorage.setItem('test-key', JSON.stringify([{ id: 1, description: 'Test' }]));
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    expect(result.current[0]).toEqual([{ id: 1, description: 'Test' }]);
  });

  it('should persist state updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    
    act(() => {
      result.current[1]([{ id: 2, description: 'New' }]);
    });
    
    expect(result.current[0]).toEqual([{ id: 2, description: 'New' }]);
    expect(JSON.parse(localStorage.getItem('test-key'))).toEqual([{ id: 2, description: 'New' }]);
  });

  it('should not crash and use default value when JSON is corrupted', () => {
    localStorage.setItem('test-key', 'invalid json {[');
    const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('should handle getItem throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error("Storage access denied");
    });
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
    expect(console.warn).toHaveBeenCalledWith("Error reading from localStorage", expect.any(Error));
  });

  it('should handle setItem throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error("Storage quota exceeded");
    });
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    
    act(() => {
      result.current[1]('new');
    });

    expect(result.current[0]).toBe('new');
    expect(console.warn).toHaveBeenCalledWith("Error writing to localStorage", expect.any(Error));
  });
});
