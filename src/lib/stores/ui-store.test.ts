import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.getState().reset();
  });

  it('starts with default state', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
    expect(state.selectedShopId).toBeNull();
    expect(state.theme).toBe('system');
  });

  it('toggles sidebar', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('sets selectedShopId', () => {
    useUIStore.getState().setSelectedShopId('shop-1');
    expect(useUIStore.getState().selectedShopId).toBe('shop-1');
  });

  it('overwrites selectedShopId', () => {
    useUIStore.getState().setSelectedShopId('shop-1');
    useUIStore.getState().setSelectedShopId('shop-2');
    expect(useUIStore.getState().selectedShopId).toBe('shop-2');
  });

  it('sets selectedShopId to null', () => {
    useUIStore.getState().setSelectedShopId('shop-1');
    useUIStore.getState().setSelectedShopId(null);
    expect(useUIStore.getState().selectedShopId).toBeNull();
  });

  it('sets theme to light', () => {
    useUIStore.getState().setTheme('light');
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('sets theme to dark', () => {
    useUIStore.getState().setTheme('dark');
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('sets theme to system', () => {
    useUIStore.getState().setTheme('light');
    useUIStore.getState().setTheme('system');
    expect(useUIStore.getState().theme).toBe('system');
  });
});
