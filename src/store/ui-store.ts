import { create } from 'zustand'
export const useUiStore = create<{ sidebarCollapsed: boolean; setSidebarCollapsed: (value: boolean) => void }>((set) => ({ sidebarCollapsed: false, setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }) }))
