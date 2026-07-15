/**
 * WorkspaceStateCompressor — Nén băm trạng thái workspace lz-string
 *
 * Đóng gói nén đối tượng JSON WorkspaceState sang chuỗi URL-Safe Base64
 * rút gọn, giải nén phục hồi lại đối tượng gốc. Áp dụng giới hạn
 * MAX_COMPRESSED_STATE_LENGTH để chặn payload khổng lồ.
 */

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

import type { WorkspaceState } from '../types/export-share.types';
import { MAX_COMPRESSED_STATE_LENGTH } from '../types/export-share.types';

export class WorkspaceStateCompressor {
  /**
   * Nén băm đối tượng JSON sang chuỗi rút gọn URL-Safe Base64
   */
  public static serializeState(state: WorkspaceState): string {
    const jsonString = JSON.stringify(state);
    return compressToEncodedURIComponent(jsonString);
  }

  /**
   * Giải nén phục hồi đối tượng WorkspaceState gốc
   */
  public static deserializeState(
    compressedString: string,
  ): WorkspaceState | null {
    try {
      const jsonString =
        decompressFromEncodedURIComponent(compressedString);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as WorkspaceState;
    } catch (err) {
      console.error('Lỗi hạ tầng giải nén trạng thái phòng lab:', err);
      return null;
    }
  }

  /**
   * Kiểm tra chuỗi nén có vượt quá giới hạn kích thước cho phép
   */
  public static isWithinSizeLimit(compressedString: string): boolean {
    return compressedString.length <= MAX_COMPRESSED_STATE_LENGTH;
  }

  /**
   * Nén và kiểm tra giới hạn — trả về chuỗi nén hoặc null nếu vượt quá
   */
  public static serializeStateWithValidation(
    state: WorkspaceState,
  ): string | null {
    const compressed = this.serializeState(state);
    if (!this.isWithinSizeLimit(compressed)) {
      console.warn(
        `WORKSPACE_OVERFLOW: Chuỗi nén ${compressed.length} ký tự vượt quá giới hạn ${MAX_COMPRESSED_STATE_LENGTH}.`,
      );
      return null;
    }
    return compressed;
  }
}
