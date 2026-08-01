<template>
  <div class="gems-shop-view p-6 max-w-6xl mx-auto">
    <!-- Header & Balance -->
    <div class="flex items-center justify-between mb-8 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
      <div class="flex items-center space-x-4">
        <div class="bg-indigo-500/20 p-4 rounded-xl text-indigo-400">
          <BaseIcon name="shopping-bag" class="w-8 h-8" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-white mb-1">Cửa hàng Gems</h1>
          <p class="text-slate-400">Dùng Gems để mua vật phẩm, avatar, thẻ bài, và tiện ích.</p>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-sm font-medium text-slate-400 mb-1">Số dư hiện tại</span>
        <div class="flex items-center text-3xl font-black text-white">
          {{ userGems }}
          <span class="ml-2 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">💎</span>
        </div>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        class="px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-medium text-sm border"
        :class="activeCategory === cat.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Items Grid -->
    <div v-if="loading" class="text-center py-20 text-slate-500">
      <BaseIcon name="refresh" class="w-10 h-10 mx-auto mb-4 animate-spin" />
      <p>Đang tải cửa hàng...</p>
    </div>
    
    <div v-else-if="filteredItems.length === 0" class="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
      <BaseIcon name="ban" class="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <p class="text-slate-400">Không có vật phẩm nào trong danh mục này.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col group hover:border-indigo-500 transition-all hover:shadow-[0_8px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1"
      >
        <!-- Item Preview Area -->
        <div class="h-40 bg-gradient-to-br from-slate-900 to-slate-800 relative flex items-center justify-center border-b border-slate-700">
          <div class="text-6xl group-hover:scale-110 transition-transform duration-300">
            {{ getItemEmoji(item.id) }}
          </div>
          
          <div class="absolute top-3 left-3 bg-slate-900/80 px-2 py-1 rounded text-xs font-bold text-slate-300 border border-slate-700">
            {{ item.type }}
          </div>
          
          <!-- Stack badge if owned -->
          <div v-if="getOwnedCount(item.id) > 0" class="absolute top-3 right-3 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">
            Đã có: {{ getOwnedCount(item.id) }}<span v-if="item.maxStack > 1">/{{ item.maxStack }}</span>
          </div>
        </div>
        
        <!-- Item Info -->
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="font-bold text-lg text-white mb-1">{{ item.name }}</h3>
          <p class="text-slate-400 text-sm mb-4 flex-1 line-clamp-2">{{ item.notes || 'Không có mô tả' }}</p>
          
          <div class="flex items-center justify-between mb-4">
            <div class="text-xl font-black" :class="userGems >= item.price ? 'text-white' : 'text-red-400'">
              {{ item.price }} <span class="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]">💎</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div v-if="isMaxStack(item)" class="w-full flex space-x-2">
            <div class="flex-1 bg-slate-700/50 text-slate-400 font-bold py-2.5 rounded-lg text-center border border-slate-600">
              Đã sở hữu
            </div>
            <button 
              v-if="item.type === 'Permanent' && item.id.startsWith('frame_')"
              @click="handleEquip(item.id.replace('frame_', ''))"
              :disabled="equippingId === item.id"
              class="flex-1 font-bold py-2.5 rounded-lg text-center transition-all bg-purple-600 hover:bg-purple-500 text-white"
            >
              <BaseIcon v-if="equippingId === item.id" name="refresh" class="w-5 h-5 mx-auto animate-spin" />
              <span v-else>{{ isEquipped(item.id) ? 'Đang dùng' : 'Trang bị' }}</span>
            </button>
          </div>
          
          <button 
            v-else
            @click="handlePurchase(item)"
            :disabled="userGems < item.price || purchasingId === item.id"
            class="w-full font-bold py-2.5 rounded-lg text-center transition-all flex items-center justify-center"
            :class="[
              userGems >= item.price 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
            ]"
          >
            <BaseIcon v-if="purchasingId === item.id" name="refresh" class="w-5 h-5 mr-2 animate-spin" />
            {{ userGems >= item.price ? 'Mua ngay' : 'Không đủ Gems' }}
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
  if (!itemId.startsWith('frame_')) return false;
  const frameType = itemId.replace('frame_', '');
  return authStore.currentUser?.avatarFrameType?.toLowerCase() === frameType.toLowerCase();
};

const getItemEmoji = (itemId: string) => {
  if (itemId.includes('hint')) return '💡';
  if (itemId.includes('streak')) return '🧊';
  if (itemId.includes('neon')) return '🌟';
  if (itemId.includes('gold')) return '🏆';
  if (itemId.includes('diamond')) return '💎';
  if (itemId.includes('theme')) return '🎨';
  if (itemId.includes('boost')) return '⚡';
  return '🎁';
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

const handleEquip = async (frameType: string) => {
  equippingId.value = `frame_${frameType}`;
  try {
    const isCurrentlyEquipped = authStore.currentUser?.avatarFrameType?.toLowerCase() === frameType.toLowerCase();
    const typeToEquip = isCurrentlyEquipped ? null : frameType;
    
    await gemsShopService.equipAvatarFrame(typeToEquip);
    toastStore.success(typeToEquip ? 'Đã trang bị khung Avatar' : 'Đã gỡ khung Avatar');
    
    if (authStore.currentUser) {
      authStore.currentUser.avatarFrameType = typeToEquip || undefined;
    }
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi trang bị khung');
  } finally {
    equippingId.value = null;
  }
};

onMounted(() => {
  loadData();
});
</script>
