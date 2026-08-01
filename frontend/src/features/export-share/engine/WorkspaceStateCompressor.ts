







import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

import type { WorkspaceState } from '../types/export-share.types';
import { MAX_COMPRESSED_STATE_LENGTH } from '../types/export-share.types';

export class WorkspaceStateCompressor {
  


  public static serializeState(state: WorkspaceState): string {
    const jsonString = JSON.stringify(state);
    return compressToEncodedURIComponent(jsonString);
  }

  


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

  


  public static isWithinSizeLimit(compressedString: string): boolean {
    return compressedString.length <= MAX_COMPRESSED_STATE_LENGTH;
  }

  


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
