/**
 * SOLIDLCOM4Calculator - Tính toán chỉ số kết dính LCOM4 (SRP Cohesion Analyzer)
 *
 * Sprint 7: SOLID Principles Visualizer
 * - Thuật toán BFS/DFS đếm số thành phần liên thông của methods truy xuất fields
 * - LCOM4 >= 2 chỉ ra lớp vi phạm SRP (Single Responsibility Principle)
 * - Visualization: Hiệu ứng nhiệt điện Canvas bốc lửa khi cohesion thấp
 */

export interface ClassField {
  name: string;
  type: string;
}

export interface ClassMethod {
  name: string;
  accessedFields: string[]; // Danh sách fields mà method này truy xuất
}

export interface ClassCohesionData {
  className: string;
  fields: ClassField[];
  methods: ClassMethod[];
}

export interface LCOM4Result {
  lcom4Value: number;
  connectedComponents: string[][]; // Các nhóm methods liên thông
  violatesSRP: boolean; // true nếu LCOM4 >= 2
  cohesionScore: number; // 0-1, 1 = cohesion cao nhất
  analysis: string;
}

export class SOLIDLCOM4Calculator {
  /**
   * Tính toán chỉ số kết dính LCOM4 (Lack of Cohesion of Methods 4)
   * Thuật toán: Đếm số thành phần liên thông trong đồ thị methods-fields
   *
   * LCOM4 = số thành phần liên thông của đồ thị
   * - LCOM4 = 1: Cohesion cao (tốt)
   * - LCOM4 >= 2: Vi phạm SRP, class làm nhiều việc khác nhau
   */
  public static calculateLCOM4(data: ClassCohesionData): LCOM4Result {
    const { methods } = data;

    if (methods.length === 0) {
      return {
        lcom4Value: 0,
        connectedComponents: [],
        violatesSRP: false,
        cohesionScore: 1,
        analysis: 'Không có methods để phân tích',
      };
    }

    // Xây dựng đồ thị liên kết methods
    // Hai methods được coi là liên thông nếu chúng cùng truy xuất ít nhất 1 field
    const adjacencyList = new Map<string, Set<string>>();

    // Khởi tạo adjacency list
    methods.forEach((m) => {
      adjacencyList.set(m.name, new Set());
    });

    // Tìm các cạnh nối giữa methods (khi chúng chia sẻ fields)
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const methodA = methods[i];
        const methodB = methods[j];

        // Kiểm tra xem hai methods có chia sẻ field nào không
        const shareFields = methodA.accessedFields.some((field) =>
          methodB.accessedFields.includes(field)
        );

        if (shareFields) {
          adjacencyList.get(methodA.name)?.add(methodB.name);
          adjacencyList.get(methodB.name)?.add(methodA.name);
        }
      }
    }

    // DFS để đếm số thành phần liên thông
    const visited = new Set<string>();
    const connectedComponents: string[][] = [];

    methods.forEach((method) => {
      if (!visited.has(method.name)) {
        const component: string[] = [];
        this.dfs(method.name, adjacencyList, visited, component);
        connectedComponents.push(component);
      }
    });

    const lcom4Value = connectedComponents.length;
    const violatesSRP = lcom4Value >= 2;

    // Tính cohesion score (0-1)
    // Công thức: 1 - (LCOM4 - 1) / (methodsCount - 1) nếu methodsCount > 1
    let cohesionScore = 1;
    if (methods.length > 1) {
      cohesionScore = Math.max(0, 1 - (lcom4Value - 1) / (methods.length - 1));
    }

    // Phân tích chi tiết
    let analysis: string;
    if (lcom4Value === 1) {
      analysis = 'Cohesion cao - Class tuân thủ SRP tốt';
    } else if (lcom4Value === 2) {
      analysis = 'Cảnh báo: Class có thể đang làm 2 việc khác nhau, cân nhắc tách lớp';
    } else {
      analysis = `Vi phạm SRP nghiêm trọng: Class có ${lcom4Value} trách nhiệm riêng biệt, cần refactor ngay`;
    }

    return {
      lcom4Value,
      connectedComponents,
      violatesSRP,
      cohesionScore,
      analysis,
    };
  }

  /**
   * DFS để tìm tất cả methods trong cùng một thành phần liên thông
   */
  private static dfs(
    node: string,
    adjacencyList: Map<string, Set<string>>,
    visited: Set<string>,
    component: string[]
  ): void {
    visited.add(node);
    component.push(node);

    const neighbors = adjacencyList.get(node) || new Set();
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        this.dfs(neighbor, adjacencyList, visited, component);
      }
    });
  }

  /**
   * Kiểm tra nhanh xem class có vi phạm SRP không
   */
  public static quickSRPCheck(data: ClassCohesionData): boolean {
    const result = this.calculateLCOM4(data);
    return result.violatesSRP;
  }

  /**
   * So sánh cohesion giữa nhiều classes
   */
  public static compareCohesion(
    classesData: ClassCohesionData[]
  ): Array<{ className: string; lcom4: number; score: number; violatesSRP: boolean }> {
    return classesData.map((data) => {
      const result = this.calculateLCOM4(data);
      return {
        className: data.className,
        lcom4: result.lcom4Value,
        score: result.cohesionScore,
        violatesSRP: result.violatesSRP,
      };
    });
  }

  /**
   * Tạo visualization data cho cohesion graph
   * Trả về nodes và edges để vẽ đồ thị liên thông
   */
  public static generateGraphData(data: ClassCohesionData): {
    nodes: Array<{ id: string; x: number; y: number; fields: string[] }>;
    edges: Array<{ source: string; target: string; sharedFields: string[] }>;
  } {
    const { methods } = data;
    const nodes: Array<{ id: string; x: number; y: number; fields: string[] }> = [];
    const edges: Array<{ source: string; target: string; sharedFields: string[] }> = [];

    // Tạo nodes theo vòng tròn
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    methods.forEach((method, index) => {
      const angle = (index * 2 * Math.PI) / methods.length - Math.PI / 2;
      nodes.push({
        id: method.name,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        fields: method.accessedFields,
      });
    });

    // Tạo edges
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const methodA = methods[i];
        const methodB = methods[j];

        const sharedFields = methodA.accessedFields.filter((field) =>
          methodB.accessedFields.includes(field)
        );

        if (sharedFields.length > 0) {
          edges.push({
            source: methodA.name,
            target: methodB.name,
            sharedFields,
          });
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Tính toán thời gian thực hiện (đo performance)
   */
  public static measurePerformance(data: ClassCohesionData): {
    result: LCOM4Result;
    executionTimeMs: number;
  } {
    const start = performance.now();
    const result = this.calculateLCOM4(data);
    const end = performance.now();

    return {
      result,
      executionTimeMs: end - start,
    };
  }
}

export default SOLIDLCOM4Calculator;
