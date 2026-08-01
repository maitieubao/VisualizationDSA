import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sessionApi } from '../service/sessionApi';
import type { HeartRecoveryInfoDto, EnterNodeResponseDto } from '../service/sessionApi';

export const useSessionStore = defineStore('session', () => {
  const showOutOfHeartsModal = ref(false);
  const outOfHeartsRecoveryInfo = ref<HeartRecoveryInfoDto | null>(null);

  const showResumePromptModal = ref(false);
  const pendingSessionInfo = ref<{ sessionId: string, currentStep: string } | null>(null);
  
  // A promise resolver for the resume prompt
  let resumePromptResolver: ((value: boolean) => void) | null = null;

  function showOutOfHearts(recoveryInfo: HeartRecoveryInfoDto) {
    outOfHeartsRecoveryInfo.value = recoveryInfo;
    showOutOfHeartsModal.value = true;
  }

  function closeOutOfHearts() {
    showOutOfHeartsModal.value = false;
    outOfHeartsRecoveryInfo.value = null;
  }

  /**
   * Prompts the user to resume or restart.
   * Returns true if they want to resume, false if they want to restart.
   */
  async function promptResume(sessionId: string, currentStep: string): Promise<boolean> {
    pendingSessionInfo.value = { sessionId, currentStep };
    showResumePromptModal.value = true;
    
    return new Promise((resolve) => {
      resumePromptResolver = resolve;
    });
  }

  function handleResumePromptDecision(resume: boolean) {
    showResumePromptModal.value = false;
    pendingSessionInfo.value = null;
    if (resumePromptResolver) {
      resumePromptResolver(resume);
      resumePromptResolver = null;
    }
  }

  return {
    showOutOfHeartsModal,
    outOfHeartsRecoveryInfo,
    showOutOfHearts,
    closeOutOfHearts,
    
    showResumePromptModal,
    pendingSessionInfo,
    promptResume,
    handleResumePromptDecision
  };
});
