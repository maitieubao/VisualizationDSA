<template>
  <div ref="lottieContainer" class="lottie-container" :style="{ width: size, height: size }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import lottie from 'lottie-web';
import type { AnimationItem } from 'lottie-web';

const props = defineProps({
  animationData: {
    type: Object,
    required: false
  },
  path: {
    type: String,
    required: false
  },
  loop: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: '100px'
  },
  speed: {
    type: Number,
    default: 1
  }
});

const lottieContainer = ref<HTMLElement | null>(null);
let anim: AnimationItem | null = null;

const initLottie = () => {
  if (anim) {
    anim.destroy();
  }

  if (lottieContainer.value) {
    anim = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: props.loop,
      autoplay: props.autoplay,
      animationData: props.animationData,
      path: props.path
    });

    if (props.speed !== 1) {
      anim.setSpeed(props.speed);
    }
  }
};

onMounted(() => {
  initLottie();
});

watch(() => [props.animationData, props.path], () => {
  initLottie();
});

onUnmounted(() => {
  if (anim) {
    anim.destroy();
  }
});
</script>

<style scoped>
.lottie-container {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto;
}
</style>
