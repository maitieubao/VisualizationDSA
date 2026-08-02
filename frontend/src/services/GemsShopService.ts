import { api } from './apiClient';

export interface ShopItemDto {
  id: string;
  name: string;
  price: number;
  type: string;
  maxStack: number;
  notes: string;
}

export interface InventoryItemDto {
  itemId: string;
  itemType: string;
  count: number;
}

export const gemsShopService = {
  getCatalog(): Promise<ShopItemDto[]> {
    return api.get('/gems-shop/catalog');
  },

  getMyInventory(): Promise<InventoryItemDto[]> {
    return api.get('/gems-shop/my-inventory');
  },

  purchaseItem(itemId: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/gems-shop/purchase/${itemId}`);
  },

  equipAvatarFrame(frameType: string | null): Promise<{ success: boolean; avatarFrameType: string | null }> {
    return api.post(`/gems-shop/equip`, { frameType });
  },

  equipAvatar(avatarId: string | null): Promise<{ success: boolean }> {
    return api.post(`/gems-shop/equip-avatar`, { avatarId });
  }
};
