import { ref, computed } from 'vue';

/**
 * Module-level state — shared across all components that use this composable.
 * Sidebar open/close state is global per page (only one LessonStudyView at a time).
 */
const isSidebarOpen = ref(false);

export function useCourseNavigation() {
  function openSidebar() {
    isSidebarOpen.value = true;
  }

  function closeSidebar() {
    isSidebarOpen.value = false;
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  return {
    isSidebarOpen: computed(() => isSidebarOpen.value),
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
}
