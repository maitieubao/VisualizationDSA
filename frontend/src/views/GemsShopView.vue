<template>
  <div class="gems-shop-view p-4 sm:p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)] animate-fade-in">
    <!-- Premium Header & Balance -->
    <div class="relative overflow-hidden mb-10 glass-panel p-8 rounded-3xl shadow-2xl">
      <!-- Glow effects -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px]"></div>
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-cyan/20 rounded-full blur-[80px]"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center space-x-5">
          <div class="bg-gradient-to-br from-accent to-accent-cyan p-4 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <BaseIcon name="shopping-bag" class="w-8 h-8 text-text-primary" />
          </div>
          <div>
            <h1 class="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bg-surface to-bg-hover mb-2">
              Cửa hàng Gems
            </h1>
            <p class="text-text-secondary text-sm sm:text-base font-medium max-w-md leading-relaxed">
              Dùng Gems để mua vật phẩm, avatar, thẻ bài, và các tiện ích độc quyền giúp hành trình học của bạn thú vị hơn.
            </p>
          </div>
        </div>
        
        <div class="flex flex-col items-start md:items-end bg-bg-primary/50 p-4 rounded-2xl border border-border-default">
          <span class="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Số dư hiện tại</span>
          <div class="flex items-center text-4xl font-black text-text-primary group cursor-default">
            {{ userGems }}
            <BaseIcon name="diamond" class="w-8 h-8 ml-3 text-accent-cyan group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex space-x-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        class="px-6 py-3 rounded-xl whitespace-nowrap transition-all font-bold text-sm border flex items-center gap-2"
        :class="activeCategory === cat.id 
          ? 'bg-gradient-to-r from-accent to-accent border-border-accent/50 text-text-primary shadow-lg shadow-accent -translate-y-0.5' 
          : 'glass-panel text-text-secondary hover:text-text-primary hover:bg-bg-surface'"
        @click="activeCategory = cat.id"
      >
        <BaseIcon v-if="cat.id === 'All'" name="gem" class="w-4 h-4" />
        <BaseIcon v-else-if="cat.id === 'Consumable'" name="zap" class="w-4 h-4" />
        <BaseIcon v-else-if="cat.id === 'Permanent'" name="profile" class="w-4 h-4" />
        <BaseIcon v-else-if="cat.id === 'XPBoost'" name="lightning" class="w-4 h-4" />
        {{ cat.name }}
      </button>
    </div>

    <!-- Items Grid -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 text-accent">
      <BaseIcon name="refresh" class="w-12 h-12 mb-4 animate-spin" />
      <p class="font-bold tracking-wide animate-pulse">Đang kết nối kho chứa...</p>
    </div>
    
    <div v-else-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-32 glass-panel rounded-3xl">
      <div class="w-20 h-20 bg-bg-hover rounded-full flex items-center justify-center mb-4">
        <BaseIcon name="ban" class="w-10 h-10 text-text-muted" />
      </div>
      <p class="text-text-secondary font-medium">Không có vật phẩm nào trong danh mục này.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        class="glass-panel spring-hover rounded-3xl overflow-hidden flex flex-col group transition-all duration-300"
      >
        <!-- Item Preview Area -->
        <div class="h-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-dark/40 via-bg-secondary to-bg-primary relative flex items-center justify-center border-b border-border-default">
          <!-- Background Glow -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-accent/10 to-transparent"></div>
          
          <BaseIcon :name="getItemIcon(item.id)" class="w-16 h-16 text-accent group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-500 relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
          
          <!-- Type Badge -->
          <div class="absolute top-4 left-4 bg-bg-primary/80 px-2.5 py-1 rounded-md text-[10px] font-black text-text-secondary border border-border-default uppercase tracking-wider backdrop-blur-md">
            {{ item.type }}
          </div>
          
          <!-- Stack badge if owned -->
          <div v-if="getOwnedCount(item.id) > 0" class="absolute top-4 right-4 bg-accent-green/20 text-accent-green px-2.5 py-1 rounded-md text-[10px] font-black border border-accent-green/30 uppercase tracking-wider backdrop-blur-md">
            Đã có: {{ getOwnedCount(item.id) }}<span v-if="item.maxStack > 1">/{{ item.maxStack }}</span>
          </div>
        </div>
        
        <!-- Item Info -->
        <div class="p-6 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-transparent to-bg-secondary/50">
          <h3 class="font-bold text-xl text-text-primary mb-2 group-hover:text-accent transition-colors">{{ item.name }}</h3>
          <p class="text-text-secondary text-sm mb-6 flex-1 line-clamp-2 leading-relaxed">{{ item.notes || 'Không có mô tả chi tiết cho vật phẩm này.' }}</p>
          
          <div class="flex items-center justify-between mb-5">
            <div class="text-2xl font-black flex items-center gap-1.5" :class="userGems >= item.price ? 'text-text-primary' : 'text-accent-red'">
              {{ item.price }} 
              <BaseIcon name="diamond" class="w-5 h-5 text-accent-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
            </div>
            
            <div v-if="userGems < item.price && !isMaxStack(item)" class="text-[10px] font-bold text-accent-red/80 bg-accent-red/10 px-2 py-1 rounded border border-accent-red/20">
              THIẾU {{ item.price - userGems }} GEMS
            </div>
          </div>
          
          <!-- Actions -->
          <div v-if="isMaxStack(item)" class="w-full flex space-x-3">
            <div class="flex-1 bg-bg-surface text-text-secondary font-bold py-3.5 rounded-xl text-center border border-border-default flex items-center justify-center gap-2">
              <BaseIcon name="check" class="w-4 h-4 text-accent-green" />
              Sở hữu tối đa
            </div>
            <button 
              v-if="item.type === 'Permanent' && (item.id.startsWith('frame_') || item.id.startsWith('avatar_'))"
              @click="handleEquip(item.id)"
              :disabled="equippingId === item.id"
              class="group flex-1 font-bold py-3.5 rounded-xl text-center transition-all flex items-center justify-center gap-2 border"
              :class="isEquipped(item.id) ? 'bg-accent/20 text-accent border-border-accent hover:bg-accent-red/20 hover:text-accent-red hover:border-accent-red/40' : 'bg-gradient-to-r from-accent-purple to-accent hover:from-accent-purple hover:to-accent text-text-primary border-transparent shadow-lg hover:shadow-accent'"
            >
              <BaseIcon v-if="equippingId === item.id" name="refresh" class="w-5 h-5 animate-spin" />
              <template v-else>
                <template v-if="isEquipped(item.id)">
                  <span class="group-hover:hidden">Đang dùng</span>
                  <span class="hidden group-hover:inline">Gỡ trang bị</span>
                </template>
                <span v-else>Trang bị</span>
              </template>
            </button>
          </div>
          
          <button 
            v-else
            @click="handlePurchase(item)"
            :disabled="userGems < item.price || purchasingId === item.id"
            class="w-full font-bold py-3.5 rounded-xl text-center transition-all flex items-center justify-center gap-2 relative overflow-hidden"
            :class="[
              userGems >= item.price 
                ? 'bg-gradient-to-r from-accent to-accent hover:from-accent hover:to-accent-light text-text-primary shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-border-accent/50 hover:scale-[1.02]' 
                : 'bg-bg-surface text-text-muted cursor-not-allowed border border-border-default'
            ]"
          >
            <!-- Highlight effect on hover for active buttons -->
            <div v-if="userGems >= item.price" class="absolute inset-0 bg-gradient-to-r from-transparent via-bg-surface/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            
            <BaseIcon v-if="purchasingId === item.id" name="refresh" class="w-5 h-5 animate-spin relative z-10" />
            <span class="relative z-10">{{ userGems >= item.price ? 'Mua vật phẩm' : 'Không đủ Gems' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { gemsShopService, type ShopItemDto, type InventoryItemDto } from '@/services/GemsShopService';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useToastStore } from '@/composables/useToast';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();

const loading = ref(true);
const purchasingId = ref<string | null>(null);
const equippingId = ref<string | null>(null);
const catalog = ref<ShopItemDto[]>([]);
const inventory = ref<InventoryItemDto[]>([]);

const activeCategory = ref('All');

const categories = [
  { id: 'All', name: 'Tất cả' },
  { id: 'Consumable', name: 'Vật phẩm tiêu hao' },
  { id: 'Permanent', name: 'Avatar / Khung' },
  { id: 'XPBoost', name: 'Tăng tốc XP' }
];

const userGems = computed(() => {
  return authStore.currentUser?.gemsCount || 0;
});

const filteredItems = computed(() => {
  if (activeCategory.value === 'All') return catalog.value;
  return catalog.value.filter(item => item.type === activeCategory.value);
});

const getOwnedCount = (itemId: string) => {
  const inv = inventory.value.find(i => i.itemId === itemId);
  return inv ? inv.count : 0;
};

const isMaxStack = (item: ShopItemDto) => {
  return getOwnedCount(item.id) >= item.maxStack;
};

const isEquipped = (itemId: string) => {
  if (itemId.startsWith('frame_')) {
    const frameType = itemId.replace('frame_', '');
    return authStore.currentUser?.avatarFrameType?.toLowerCase() === frameType.toLowerCase();
  }
  if (itemId.startsWith('avatar_')) {
    const avatarName = itemId.replace('avatar_', '').replace('_', '-');
    return authStore.currentUser?.avatarUrl?.includes(avatarName) || false;
  }
  return false;
};

const getItemIcon = (itemId: string) => {
  if (itemId.includes('hint')) return 'bulb';
  if (itemId.includes('streak')) return 'fire';
  if (itemId.includes('neon')) return 'sparkles';
  if (itemId.includes('gold')) return 'trophy';
  if (itemId.includes('diamond')) return 'diamond';
  if (itemId.includes('theme')) return 'gem';
  if (itemId.includes('boost')) return 'zap';
  if (itemId.startsWith('avatar_')) return 'profile';
  if (itemId.startsWith('frame_')) return 'crown';
  return 'gem';
};

const loadData = async () => {
  loading.value = true;
  try {
    const [catRes, invRes] = await Promise.all([
      gemsShopService.getCatalog(),
      gemsShopService.getMyInventory()
    ]);
    catalog.value = catRes;
    inventory.value = invRes;
    
    // Refresh user data to get accurate gems if we have a fetchUser method
    // await authStore.fetchCurrentUser();
  } catch (err: any) {
    toastStore.error('Lỗi khi tải dữ liệu cửa hàng');
  } finally {
    loading.value = false;
  }
};

const handlePurchase = async (item: ShopItemDto) => {
  purchasingId.value = item.id;
  try {
    const res = await gemsShopService.purchaseItem(item.id);
    toastStore.success(`Mua ${item.name} thành công!`);
    
    // Update local gems
    if (authStore.currentUser) {
      authStore.currentUser.gemsCount = (authStore.currentUser.gemsCount || 0) - item.price;
    }
    
    // Update inventory locally
    const existing = inventory.value.find(i => i.itemId === item.id);
    if (existing) {
      existing.count += 1;
    } else {
      inventory.value.push({ itemId: item.id, itemType: item.type, count: 1 });
    }
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi mua hàng');
  } finally {
    purchasingId.value = null;
  }
};

const handleEquip = async (itemId: string) => {
  equippingId.value = itemId;
  try {
    const currentlyEquipped = isEquipped(itemId);
    
    if (itemId.startsWith('frame_')) {
      const frameType = itemId.replace('frame_', '');
      const typeToEquip = currentlyEquipped ? null : frameType;
      
      await gemsShopService.equipAvatarFrame(typeToEquip);
      toastStore.success(typeToEquip ? 'Đã trang bị khung Avatar' : 'Đã gỡ khung Avatar');
      
      if (authStore.currentUser) {
        authStore.currentUser.avatarFrameType = typeToEquip || undefined;
      }
    } else if (itemId.startsWith('avatar_')) {
      const typeToEquip = currentlyEquipped ? null : itemId;
      
      await gemsShopService.equipAvatar(typeToEquip);
      toastStore.success(typeToEquip ? 'Đã đổi Avatar' : 'Đã gỡ Avatar');
      
      if (authStore.currentUser) {
        if (typeToEquip) {
          const avatarName = itemId.replace('avatar_', '').replace('_', '-');
          authStore.currentUser.avatarUrl = `/assets/avatars/${avatarName}.png`;
        } else {
          authStore.currentUser.avatarUrl = undefined;
        }
      }
    }
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi trang bị');
  } finally {
    equippingId.value = null;
  }
};

onMounted(() => {
  loadData();
});
</script>
