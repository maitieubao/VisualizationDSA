<template>
  <div class="landing">
    
    <!-- ── HERO SECTION ── -->
    <section class="hero relative overflow-hidden">
      <vue-particles
        id="tsparticles"
        class="absolute inset-0 pointer-events-auto z-0"
        :options="{
          background: { color: { value: 'transparent' } },
          fpsLimit: 120,
          particles: {
            color: { value: '#06b6d4' },
            links: {
              color: '#3b82f6',
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1
            },
            move: {
              enable: true,
              speed: 1.5,
              direction: 'none',
              random: false,
              straight: false,
              outModes: 'bounce'
            },
            number: { value: 50, density: { enable: true, area: 800 } },
            opacity: { value: 0.5 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } }
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'grab' },
              onClick: { enable: true, mode: 'push' }
            },
            modes: {
              grab: { distance: 140, links: { opacity: 0.8 } },
              push: { quantity: 4 }
            }
          },
          detectRetina: true
        }"
      />
      
      <div class="hero__glow z-0"></div>
      <div class="hero__particles z-0"></div>
      
      <div class="hero__content">
        <div class="hero__badge">
          <span class="pulse-dot"></span>
          <span>Nền tảng học thuật chuẩn bị ra mắt</span>
        </div>
        
        <h1 class="hero__title font-display">
          <span class="hero__prefix text-accent drop-shadow-md">~/</span>
          Khám phá thuật toán theo cách <span class="text-gradient">sống động nhất</span>
        </h1>
        
        <p class="hero__sub font-sans">
          Trực quan hóa cấu trúc dữ liệu, đồ thị, và design patterns. 
          Hệ thống gamification giúp bạn biến việc học code thành một hành trình thú vị.
        </p>
        
        <div class="hero__actions">
          <button class="btn-primary hero-btn" @click="handleCta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            {{ authStore.isAuthenticated ? 'Vào bảng điều khiển' : 'Bắt đầu học ngay' }}
          </button>
          
          <a href="https://github.com/maitieubao/VisualizationDSA" target="_blank" rel="noopener noreferrer" class="btn-ghost hero-btn">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Xem mã nguồn
          </a>
        </div>
      </div>
      
      <!-- Interactive Preview Graphic -->
      <div class="hero__preview z-10" aria-hidden="true" data-aos="fade">
        <div class="glass-panel preview-window">
          <div class="preview-header">
            <div class="terminal-dots">
              <span class="terminal-dot terminal-dot--close"></span>
              <span class="terminal-dot terminal-dot--min"></span>
              <span class="terminal-dot terminal-dot--max"></span>
            </div>
            <div class="preview-title font-mono text-muted text-xs">quick-sort.ts</div>
          </div>
          <div class="preview-body">
            <div class="bars-container">
              <div class="bar bar-1"></div>
              <div class="bar bar-2 active"></div>
              <div class="bar bar-3"></div>
              <div class="bar bar-4 pivot"></div>
              <div class="bar bar-5"></div>
              <div class="bar bar-6 sorted"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STATS COUNTER ── -->
    <section class="stats-section z-10 relative">
      <div class="stats-container glass-panel" data-aos="fade-up">
        <div class="stat-item" v-for="(stat, index) in stats" :key="stat.label">
          <div class="stat-icon text-accent opacity-80 mb-2"><BaseIcon :name="stat.icon" v-if="stat.icon"/></div>
          <div class="stat-value font-display text-gradient"><span :class="'stat-num-' + index">{{ stat.value }}</span>{{ stat.suffix }}</div>
          <div class="stat-label text-muted">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- ── BENTO GRID FEATURES ── -->
    <section class="features-section">
      <div class="features-header text-center mb-12">
        <h2 class="font-display text-3xl mb-4 text-heading">Không chỉ là code, đó là nghệ thuật</h2>
        <p class="text-secondary max-w-2xl mx-auto">Trải nghiệm nền tảng giáo dục kết hợp với giao diện cinematic dark-mode hiện đại, mang lại cảm hứng sáng tạo vô tận.</p>
      </div>
      
      <div class="bento-grid">
        <!-- Large Card: Sorting -->
        <div class="bento-card bento-large glass-panel spring-hover" data-aos="fade-up" data-aos-delay="100">
          <div class="bento-content">
            <div class="bento-icon text-accent"><BaseIcon name="sorting" /></div>
            <h3 class="font-display text-xl text-heading mb-2">Thuật toán Sắp xếp</h3>
            <p class="text-secondary text-sm">7 thuật toán sắp xếp với hệ thống hoạt ảnh VCR điều khiển từng bước tiến trình. Dễ dàng quan sát cách Bubble, Quick, hay Merge Sort hoạt động.</p>
          </div>
          <div class="bento-visual visual-sorting"></div>
        </div>
        
        <!-- Medium Card: Graph -->
        <div class="bento-card bento-medium glass-panel spring-hover" data-aos="fade-up" data-aos-delay="200">
          <div class="bento-content">
            <div class="bento-icon text-accent-warm"><BaseIcon name="graph" /></div>
            <h3 class="font-display text-xl text-heading mb-2">Sân chơi Đồ thị</h3>
            <p class="text-secondary text-sm">Tự do kéo thả các đỉnh đồ thị, kết nối cạnh và chạy BFS/DFS/Dijkstra trực tiếp.</p>
          </div>
        </div>
        
        <!-- Medium Card: Gamification -->
        <div class="bento-card bento-medium glass-panel spring-hover" data-aos="fade-up" data-aos-delay="300">
          <div class="bento-content">
            <div class="bento-icon text-accent-purple"><BaseIcon name="gamification" /></div>
            <h3 class="font-display text-xl text-heading mb-2">Học mà Chơi</h3>
            <p class="text-secondary text-sm">Kiếm điểm XP, nhận huy hiệu và thăng cấp sau mỗi bài học hoàn thành.</p>
          </div>
        </div>
        
        <!-- Small Cards -->
        <div class="bento-card bento-small glass-panel spring-hover" data-aos="fade-up" data-aos-delay="400">
          <div class="bento-icon text-accent-cyan"><BaseIcon name="oop" /></div>
          <h3 class="font-display text-lg text-heading mb-1">OOP</h3>
          <p class="text-secondary text-xs">Làm chủ Lập trình Hướng đối tượng.</p>
        </div>
        
        <div class="bento-card bento-small glass-panel spring-hover">
          <div class="bento-icon text-accent-green"><BaseIcon name="solid" /></div>
          <h3 class="font-display text-lg text-heading mb-1">SOLID</h3>
          <p class="text-secondary text-xs">5 nguyên lý thiết kế phần mềm linh hoạt.</p>
        </div>
        
        <div class="bento-card bento-small glass-panel spring-hover">
          <div class="bento-icon text-accent-pink"><BaseIcon name="patterns" /></div>
          <h3 class="font-display text-lg text-heading mb-1">Patterns</h3>
          <p class="text-secondary text-xs">Mẫu thiết kế (Design Patterns) phổ biến.</p>
        </div>
        
        <div class="bento-card bento-small glass-panel spring-hover">
          <div class="bento-icon text-accent-blue"><BaseIcon name="di" /></div>
          <h3 class="font-display text-lg text-heading mb-1">DI/IoC</h3>
          <p class="text-secondary text-xs">Dependency Injection & Inversion of Control.</p>
        </div>
      </div>
    </section>

    <!-- ── ROADMAP SECTION ── -->
    <section class="extended-section roadmap-section">
      <div class="extended-container">
        <div class="extended-text">
          <h2 class="font-display text-3xl mb-4 text-heading">Học tập qua Lộ trình (Roadmap) thay vì Mò mẫm</h2>
          <p class="text-secondary mb-6">Hệ thống bài học được thiết kế chuẩn sư phạm, dẫn dắt bạn qua 4 bước vững chắc: Lý thuyết ➔ Trực quan hoá ➔ Thực hành Code ➔ Trắc nghiệm.</p>
          <ul class="feature-list text-muted">
            <li><span class="text-accent">●</span> Lộ trình từ cơ bản đến nâng cao (Mảng, Cây, Đồ thị).</li>
            <li><span class="text-accent">●</span> Theo dõi tiến độ học tập chi tiết.</li>
            <li><span class="text-accent">●</span> Nhận chứng nhận khi hoàn thành khóa học.</li>
          </ul>
        </div>
        <div class="extended-visual" aria-hidden="true">
          <div class="roadmap-mockup glass-panel">
            <div class="rm-node completed"><div class="rm-icon"><BaseIcon name="check" class="w-3.5 h-3.5" /></div><div class="rm-label font-sans font-medium">Mảng & Chuỗi</div></div>
            <div class="rm-line completed"></div>
            <div class="rm-node active"><div class="rm-icon"><BaseIcon name="zap" class="w-3.5 h-3.5" /></div><div class="rm-label font-sans font-medium">Đồ Thị BFS/DFS</div></div>
            <div class="rm-line"></div>
            <div class="rm-node"><div class="rm-icon"><BaseIcon name="lock" class="w-3.5 h-3.5" /></div><div class="rm-label font-sans font-medium">Quy Hoạch Động</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CODELAB SECTION ── -->
    <section class="extended-section codelab-section reverse">
      <div class="extended-container">
        <div class="extended-text">
          <h2 class="font-display text-3xl mb-4 text-heading">Thực hành Code Trực tiếp (Codelab)</h2>
          <p class="text-secondary mb-6">Không chỉ dừng lại ở việc xem animation. Bạn sẽ được cấp ngay một trình soạn thảo Monaco chuyên nghiệp và hệ thống chấm điểm tự động đa ngôn ngữ ngay trên trình duyệt.</p>
          <ul class="feature-list text-muted">
            <li><span class="text-accent-green">●</span> Chấm code tự động y hệt LeetCode (Judge0 API).</li>
            <li><span class="text-accent-green">●</span> Hỗ trợ C#, TypeScript, Python, Java.</li>
            <li><span class="text-accent-green">●</span> Đánh giá Time & Space Complexity thực tế.</li>
          </ul>
        </div>
        <div class="extended-visual" aria-hidden="true">
          <div class="codelab-mockup clay-card">
            <div class="terminal-header">
              <div class="terminal-dots"><span class="terminal-dot terminal-dot--close"></span><span class="terminal-dot terminal-dot--min"></span><span class="terminal-dot terminal-dot--max"></span></div>
              <div class="terminal-title font-mono text-muted text-xs">two-sum.ts</div>
            </div>
            <div class="terminal-body font-mono text-xs">
              <div class="code-line"><span class="text-accent-purple">function</span> <span class="text-accent-blue">twoSum</span>(nums, target) {</div>
              <div class="code-line indent">  <span class="text-accent-purple">const</span> map = <span class="text-accent-purple">new</span> <span class="text-accent-warm">Map</span>();</div>
              <div class="code-line indent">  <span class="text-accent-purple">for</span> (<span class="text-accent-purple">let</span> i = <span class="text-accent-warm">0</span>; i < nums.length; i++) {</div>
              <div class="code-line indent-2 text-muted">    // Code logic here...</div>
              <div class="code-line indent">  }</div>
              <div class="code-line">}</div>
              <div class="code-line mt-4 text-accent-green">>> All 15/15 Test Cases Passed! (12ms) <BaseIcon name="check-circle" class="w-3.5 h-3.5 inline-block align-text-bottom" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── AI ASSISTANT SECTION ── -->
    <section class="extended-section ai-section">
      <div class="extended-container">
        <div class="extended-text">
          <h2 class="font-display text-3xl mb-4 text-heading">AI Assistant - Người Mentor Tận Tụy</h2>
          <p class="text-secondary mb-6">Mắc kẹt ở một bài toán khó? Trợ lý ảo AI luôn túc trực 24/7 để gợi ý hướng giải quyết, giải thích lỗi sai (Bug) và tối ưu hóa đoạn code của bạn mà không hề tiết lộ đáp án.</p>
        </div>
        <div class="extended-visual" aria-hidden="true">
          <div class="ai-mockup clay-card">
            <div class="ai-chat user">Tại sao Quick Sort bị O(N²) ở TH xấu nhất?</div>
            <div class="ai-chat bot">
              <span class="ai-icon text-accent-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </span>
              <div class="ai-msg typing-effect">Trường hợp xấu nhất <strong>O(N²)</strong> xảy ra khi mảng đã được sắp xếp sẵn và bạn luôn chọn pivot là phần tử cuối/đầu. Khi đó, mảng bị chia thành 1 phần có N-1 phần tử và 1 phần có 0 phần tử.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA SECTION ── -->
    <section class="cta-section">
      <div class="cta-card glass-panel">
        <h2 class="font-display text-3xl mb-4 text-heading">Sẵn sàng nâng cao trình độ?</h2>
        <p class="text-secondary mb-8 max-w-lg mx-auto">Gia nhập cộng đồng sinh viên lập trình Việt Nam và làm chủ Cấu trúc Dữ liệu & Giải thuật ngay hôm nay.</p>
        <button class="btn-primary hero-btn mx-auto" @click="handleCta">
          Tạo tài khoản miễn phí
        </button>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="landing-footer border-t border-border-default mt-16 py-8 px-6 text-center text-sm text-muted">
      <div class="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>&copy; 2026 VisualizationDSA. Nền tảng học tập thuật toán.</div>
        <div class="flex gap-4">
          <a href="#" class="hover:text-accent-primary transition-colors">Điều khoản sử dụng</a>
          <a href="#" class="hover:text-accent-primary transition-colors">Bảo mật</a>
          <a href="https://github.com/maitieubao/VisualizationDSA" target="_blank" class="hover:text-accent-primary transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
    
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const emit = defineEmits<{ openLogin: [] }>();
const authStore = useAuthStore();
const router = useRouter();

function handleCta(): void {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  } else {
    emit('openLogin');
  }
}

const stats = [
  { value: 7, suffix: '+', label: 'Thuật toán Sắp xếp', icon: 'sorting' },
  { value: 27, suffix: '+', label: 'Câu hỏi Trắc nghiệm', icon: 'gamification' },
  { value: 8, suffix: '', label: 'Cấp độ Huy hiệu', icon: 'patterns' },
  { value: 100, suffix: '%', label: 'Tiếng Việt', icon: 'oop' },
];

let ctx: gsap.Context;

onMounted(() => {
  ctx = gsap.context(() => {
    // Hero Title Stagger
    gsap.from('.hero__badge, .hero__title, .hero__sub, .hero__actions', {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2
    });

    // Stats Counter
    stats.forEach((stat, i) => {
      gsap.fromTo(`.stat-num-${i}`, 
        { innerHTML: 0 },
        {
          innerHTML: stat.value,
          duration: 2.5,
          ease: 'power2.out',
          snap: { innerHTML: 1 },
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 85%',
          }
        }
      );
    });

    // Roadmap scrub
    gsap.from('.roadmap-mockup .rm-node:not(.completed)', {
      opacity: 0.3,
      scale: 0.9,
      stagger: 0.3,
      scrollTrigger: {
        trigger: '.roadmap-section',
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: 1
      }
    });
  });
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<style scoped>
@import "./LandingView.css";
</style>
