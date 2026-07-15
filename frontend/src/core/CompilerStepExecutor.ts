export interface PlaybackFrame {
  stepIndex: number;
  canvasStateSnapshot: {
    array: number[];
    comparingIndices?: [number, number];
    swappingIndices?: [number, number];
    loopVariables?: Record<string, number>;
    highlightedIndices?: number[];
  };
  lineNumber: number;
  description: string;
}

export interface StepToLineMapping {
  stepIndex: number;
  lineNumber: number;
  codeSnippet: string;
}

/** Narrows a heterogeneous VCR frame to a compiler PlaybackFrame (carries canvasStateSnapshot). */
export function isPlaybackFrame(frame: unknown): frame is PlaybackFrame {
  return typeof frame === 'object' && frame !== null && 'canvasStateSnapshot' in frame;
}

export class CompilerStepExecutor {
  /**
   * Biên dịch mã nguồn giải thuật sinh Playback Frames.
   * Kết hợp thực thi Sandbox JS động (với line-tracking và proxy) và cơ chế fallback Regex tĩnh.
   */
  public static compileAlgorithm(sourceCode: string, initialArray: number[] = [45, 12, 85, 32, 9, 60]): PlaybackFrame[] {
    try {
      return CompilerStepExecutor.compileJavaScript(sourceCode, initialArray);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Vượt quá giới hạn thực thi")) {
        throw err;
      }
      console.warn("Chuyển sang cơ chế biên dịch Regex tĩnh:", message);
      return CompilerStepExecutor.compilePseudocodeRegex(sourceCode, initialArray);
    }
  }

  /**
   * Thực thi mã nguồn JavaScript động trong một Sandbox an toàn.
   */
  private static compileJavaScript(sourceCode: string, initialArray: number[]): PlaybackFrame[] {
    const frames: PlaybackFrame[] = [];
    let currentLine = 0;
    let stepCount = 0;
    let inSwap = false;
    const highlighted: number[] = [];

    // Sao chép sâu mảng ban đầu
    const mockArray = [...initialArray];

    // Trạng thái chia sẻ
    const state = {
      array: mockArray,
      vars: {} as Record<string, number>
    };

    // Callback ghi nhận từng dòng lệnh thực thi
    const trackLine = (lineNum: number, variables: Record<string, any>) => {
      stepCount++;
      if (stepCount > 10000) {
        throw new Error("Vượt quá giới hạn thực thi (tối đa 10000 bước). Có thể có vòng lặp vô hạn!");
      }
      currentLine = lineNum;

      // Ghi nhận snapshot các biến chạy
      const loopVars: Record<string, number> = {};
      for (const [name, val] of Object.entries(variables)) {
        if (typeof val === 'number') {
          loopVars[name] = val;
        }
      }
      state.vars = loopVars;

      // Thêm frame mặc định cho bước này
      frames.push({
        stepIndex: frames.length,
        lineNumber: lineNum,
        description: `Đang chạy dòng ${lineNum}`,
        canvasStateSnapshot: {
          array: [...state.array],
          loopVariables: { ...loopVars },
          highlightedIndices: [...highlighted]
        }
      });
    };

    // Phân hệ ghi nhận so sánh phần tử
    const compare = (a: number, b: number) => {
      if (typeof a !== 'number' || typeof b !== 'number') return;
      
      const lastFrame = frames[frames.length - 1];
      const desc = `So sánh phần tử tại vị trí ${a} (${state.array[a]}) và ${b} (${state.array[b]})`;
      
      if (lastFrame && lastFrame.lineNumber === currentLine) {
        lastFrame.description = desc;
        lastFrame.canvasStateSnapshot.comparingIndices = [a, b];
      } else {
        frames.push({
          stepIndex: frames.length,
          lineNumber: currentLine,
          description: desc,
          canvasStateSnapshot: {
            array: [...state.array],
            comparingIndices: [a, b],
            loopVariables: { ...state.vars },
            highlightedIndices: [...highlighted]
          }
        });
      }
    };

    // Phân hệ ghi nhận hoán vị phần tử
    const swap = (a: number, b: number) => {
      if (typeof a !== 'number' || typeof b !== 'number') return;
      if (a < 0 || a >= state.array.length || b < 0 || b >= state.array.length) return;

      inSwap = true;
      const temp = state.array[a];
      state.array[a] = state.array[b];
      state.array[b] = temp;
      inSwap = false;

      const desc = `Tráo đổi phần tử tại vị trí ${a} (${state.array[b]}) và ${b} (${state.array[a]})`;
      const lastFrame = frames[frames.length - 1];
      
      if (lastFrame && lastFrame.lineNumber === currentLine) {
        lastFrame.description = desc;
        lastFrame.canvasStateSnapshot.swappingIndices = [a, b];
        lastFrame.canvasStateSnapshot.array = [...state.array];
      } else {
        frames.push({
          stepIndex: frames.length,
          lineNumber: currentLine,
          description: desc,
          canvasStateSnapshot: {
            array: [...state.array],
            swappingIndices: [a, b],
            loopVariables: { ...state.vars },
            highlightedIndices: [...highlighted]
          }
        });
      }
    };

    // Phân hệ ghi nhận tô sáng/hoàn thành phần tử
    const highlight = (a: number) => {
      if (typeof a !== 'number') return;
      if (a < 0 || a >= state.array.length) return;

      if (!highlighted.includes(a)) {
        highlighted.push(a);
      }

      const desc = `Đánh dấu phần tử tại vị trí ${a} (${state.array[a]}) đã hoàn thành`;
      const lastFrame = frames[frames.length - 1];
      
      if (lastFrame && lastFrame.lineNumber === currentLine) {
        lastFrame.description = desc;
        lastFrame.canvasStateSnapshot.highlightedIndices = [...highlighted];
      } else {
        frames.push({
          stepIndex: frames.length,
          lineNumber: currentLine,
          description: desc,
          canvasStateSnapshot: {
            array: [...state.array],
            loopVariables: { ...state.vars },
            highlightedIndices: [...highlighted]
          }
        });
      }
    };

    // 1. Chuẩn hóa mã nguồn: Hỗ trợ cú pháp swap(arr[i], arr[j]) thành swap(i, j)
    let processedCode = sourceCode
      .replace(/compare\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*,\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'compare($1, $2)')
      .replace(/swap\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*,\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'swap($1, $2)')
      .replace(/highlight\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'highlight($1)');

    // 2. Tự động thu thập tất cả các biến khai báo trong code
    const varRegex = /\b(?:let|var|const)\s+([a-zA-Z_]\w*)\b/g;
    const declaredVars = new Set<string>(['i', 'j', 'k', 'temp']); // Biến mặc định
    let match;
    while ((match = varRegex.exec(processedCode)) !== null) {
      declaredVars.add(match[1]);
    }
    
    // Loại trừ các tên hàm hoặc biến bảo lưu hệ thống
    declaredVars.delete('array');
    declaredVars.delete('arr');
    declaredVars.delete('compare');
    declaredVars.delete('swap');
    declaredVars.delete('highlight');

    // Khai báo biến trước ở đầu hàm tránh Temporal Dead Zone (TDZ)
    const varDeclarations = Array.from(declaredVars).map(v => `let ${v} = undefined;`).join('\n');

    // Thay thế các từ khóa let/var/const của biến đó thành phép gán thuần túy
    declaredVars.forEach(v => {
      const declRegex = new RegExp(`\\b(?:let|const|var)\\s+${v}\\b`, 'g');
      processedCode = processedCode.replace(declRegex, v);
    });

    // 3. Phân tích từng dòng và chèn mã theo dõi trackLine
    const lines = processedCode.split('\n');
    const instrumentedLines: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNum = index + 1;

      const isCommentOrEmpty = !trimmed || trimmed.startsWith('//');
      // Bỏ qua các dòng đóng ngoặc nhọn đơn thuần hoặc cấu trúc điều khiển rẽ nhánh
      const isBlockControl = trimmed.startsWith('}') || trimmed.startsWith('else');

      if (isCommentOrEmpty || isBlockControl) {
        instrumentedLines.push(line);
      } else {
        const varsObjStr = `{ ${Array.from(declaredVars).map(v => `${v}: typeof ${v} !== 'undefined' ? ${v} : undefined`).join(', ')} }`;
        instrumentedLines.push(`__trackLine(${lineNum}, ${varsObjStr}); ${line}`);
      }
    });

    // 4. Wrap mảng Proxy để bắt các thao tác gán trực tiếp arr[i] = val
    const arrayProxy = new Proxy(state.array, {
      get(target, prop) {
        if (prop === 'length') return target.length;
        const idx = Number(prop);
        if (!isNaN(idx)) {
          return target[idx];
        }
        return (target as any)[prop];
      },
      set(target, prop, value) {
        const idx = Number(prop);
        if (!isNaN(idx)) {
          target[idx] = value;
          
          if (!inSwap) {
            const desc = `Gán array[${idx}] = ${value}`;
            const lastFrame = frames[frames.length - 1];
            if (lastFrame && lastFrame.lineNumber === currentLine) {
              lastFrame.description = desc;
              lastFrame.canvasStateSnapshot.array = [...target];
            } else {
              frames.push({
                stepIndex: frames.length,
                lineNumber: currentLine,
                description: desc,
                canvasStateSnapshot: {
                  array: [...target],
                  loopVariables: { ...state.vars },
                  highlightedIndices: [...highlighted]
                }
              });
            }
          }
          return true;
        }
        (target as any)[prop] = value;
        return true;
      }
    });

    // 5. Khởi tạo và chạy hàm Sandbox
    const sandbox = new Function(
      'array',
      'arr',
      'compare',
      'swap',
      'highlight',
      '__trackLine',
      `
        ${varDeclarations}
        ${instrumentedLines.join('\n')}
      `
    );

    sandbox(arrayProxy, arrayProxy, compare, swap, highlight, trackLine);

    return frames;
  }

  /**
   * Bộ biên dịch Regex tĩnh kế thừa nguyên bản cho các dòng mã giả thuần túy.
   */
  private static compilePseudocodeRegex(sourceCode: string, initialArray: number[]): PlaybackFrame[] {
    const lines = sourceCode.split('\n');
    const frames: PlaybackFrame[] = [];
    let currentStep = 0;
    let mockArray = [...initialArray];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNum = index + 1;

      if (!trimmed || trimmed.startsWith('//')) {
        return; // Bỏ qua bình luận
      }

      const swapRegex = /swap\s*\(?\s*arr\[(\d+)\]\s*,\s*arr\[(\d+)\]\s*\)?/i;
      const compareRegex = /compare\s*\(?\s*arr\[(\d+)\]\s*,\s*arr\[(\d+)\]\s*\)?/i;

      const swapMatch = trimmed.match(swapRegex);
      const compareMatch = trimmed.match(compareRegex);

      if (swapMatch) {
        const idx1 = parseInt(swapMatch[1], 10);
        const idx2 = parseInt(swapMatch[2], 10);

        if (idx1 < mockArray.length && idx2 < mockArray.length) {
          const temp = mockArray[idx1];
          mockArray[idx1] = mockArray[idx2];
          mockArray[idx2] = temp;

          frames.push({
            stepIndex: currentStep++,
            lineNumber: lineNum,
            description: `Tráo đổi phần tử tại vị trí ${idx1} (${mockArray[idx2]}) và ${idx2} (${mockArray[idx1]})`,
            canvasStateSnapshot: {
              array: [...mockArray],
              swappingIndices: [idx1, idx2]
            }
          });
        } else {
          mockArray = [...mockArray].reverse();
          frames.push({
            stepIndex: currentStep++,
            lineNumber: lineNum,
            description: `Thực thi hoán vị mảng: [${mockArray.join(', ')}]`,
            canvasStateSnapshot: {
              array: [...mockArray]
            }
          });
        }
      } else if (compareMatch) {
        const idx1 = parseInt(compareMatch[1], 10);
        const idx2 = parseInt(compareMatch[2], 10);

        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: `So sánh phần tử tại vị trí ${idx1} (${mockArray[idx1]}) và ${idx2} (${mockArray[idx2]})`,
          canvasStateSnapshot: {
            array: [...mockArray],
            comparingIndices: [idx1, idx2]
          }
        });
      } else if (trimmed.startsWith('swap') || trimmed.includes('temp =')) {
        mockArray = [...mockArray].reverse();
        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: `Thực thi hoán vị mảng: [${mockArray.join(', ')}]`,
          canvasStateSnapshot: {
            array: [...mockArray]
          }
        });
      } else if (trimmed.startsWith('if') || trimmed.startsWith('compare') || trimmed.includes('compare')) {
        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: `So sánh các phần tử`,
          canvasStateSnapshot: {
            array: [...mockArray],
            comparingIndices: [0, 1]
          }
        });
      } else if (trimmed.startsWith('loop') || trimmed.startsWith('for') || trimmed.startsWith('while')) {
        const loopRegex = /(?:loop|for|while)\s+(\w+)(?:\s+from\s+(\d+|[a-zA-Z_]+))?/i;
        const loopMatch = trimmed.match(loopRegex);
        const loopVars: Record<string, number> = {};
        const highlighted: number[] = [];
        let desc = `Bắt đầu vòng lặp: ${trimmed}`;
        
        if (loopMatch) {
          const varName = loopMatch[1];
          const valStr = loopMatch[2];
          let val = 0;
          if (valStr) {
            val = isNaN(Number(valStr)) ? 0 : parseInt(valStr, 10);
          }
          loopVars[varName] = val;
          desc = `Bắt đầu vòng lặp điều kiện với biến '${varName}' khởi chạy tại ${valStr || 0}`;
          if (val >= 0 && val < mockArray.length) {
            highlighted.push(val);
          }
        }

        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: desc,
          canvasStateSnapshot: {
            array: [...mockArray],
            loopVariables: loopVars,
            highlightedIndices: highlighted
          }
        });
      }
    });

    return frames;
  }

  /**
   * Tạo bản đồ ánh xạ từ bước giải thuật sang dòng code.
   */
  public static generateStepToLineMapping(sourceCode: string, frames: PlaybackFrame[]): StepToLineMapping[] {
    const lines = sourceCode.split('\n');
    return frames.map(frame => {
      const lineIdx = frame.lineNumber - 1;
      const snippet = (lineIdx >= 0 && lineIdx < lines.length) ? lines[lineIdx].trim() : '';
      return {
        stepIndex: frame.stepIndex,
        lineNumber: frame.lineNumber,
        codeSnippet: snippet
      };
    });
  }
}
