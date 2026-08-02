<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLanguageStore } from '@/features/dsa/dsa-modules/store/languageStore';
import LanguageSelectorModal from '@/features/dsa/dsa-modules/components/LanguageSelectorModal.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const languageStore = useLanguageStore();

const currentLang = computed(() => {
  const langId = languageStore.currentLanguage;
  if (langId === 'cpp') return 'C++';
  if (langId === 'java') return 'Java';
  if (langId === 'python') return 'Python';
  if (langId === 'javascript') return 'JavaScript';
  return 'Ngôn ngữ (Chưa chọn)';
});

const openLanguageModal = () => {
  languageStore.isModalOpen = true;
};

const activeTab = ref('arrays');

const dsData: Record<string, any> = {
  arrays: {
    title: 'Mảng (Arrays)',
    timeComplexity: { access: 'O(1)', search: 'O(n)', insertion: 'O(n)', deletion: 'O(n)' },
    code: {
      cpp: `// Khởi tạo mảng\nint arr[5] = {1, 2, 3, 4, 5};\n\n// Truy cập phần tử\nint first = arr[0];\n\n// Duyệt mảng\nfor(int i = 0; i < 5; i++) {\n    std::cout << arr[i] << " ";\n}`,
      java: `// Khởi tạo mảng\nint[] arr = {1, 2, 3, 4, 5};\n\n// Truy cập phần tử\nint first = arr[0];\n\n// Duyệt mảng\nfor(int i = 0; i < arr.length; i++) {\n    System.out.print(arr[i] + " ");\n}`,
      python: `# Khởi tạo mảng (List)\narr = [1, 2, 3, 4, 5]\n\n# Truy cập phần tử\nfirst = arr[0]\n\n# Duyệt mảng\nfor val in arr:\n    print(val, end=" ")`,
      javascript: `// Khởi tạo mảng\nconst arr = [1, 2, 3, 4, 5];\n\n// Truy cập phần tử\nlet first = arr[0];\n\n// Duyệt mảng\narr.forEach(val => console.log(val));`
    }
  },
  linkedlist: {
    title: 'Danh sách liên kết (Linked List)',
    timeComplexity: { access: 'O(n)', search: 'O(n)', insertion: 'O(1)', deletion: 'O(1)' },
    code: {
      cpp: `struct Node {\n    int data;\n    Node* next;\n    Node(int d) : data(d), next(nullptr) {}\n};\n\n// Thêm vào đầu\nNode* head = new Node(1);\nNode* newNode = new Node(2);\nnewNode->next = head;\nhead = newNode;`,
      java: `class Node {\n    int data;\n    Node next;\n    Node(int d) { data = d; }\n}\n\n// Thêm vào đầu\nNode head = new Node(1);\nNode newNode = new Node(2);\nnewNode.next = head;\nhead = newNode;`,
      python: `class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\n# Thêm vào đầu\nhead = Node(1)\nnew_node = Node(2)\nnew_node.next = head\nhead = new_node`,
      javascript: `class Node {\n    constructor(data) {\n        this.data = data;\n        this.next = null;\n    }\n}\n\n// Thêm vào đầu\nlet head = new Node(1);\nlet newNode = new Node(2);\nnewNode.next = head;\nhead = newNode;`
    }
  },
  bst: {
    title: 'Cây nhị phân (BST)',
    timeComplexity: { access: 'O(log n)', search: 'O(log n)', insertion: 'O(log n)', deletion: 'O(log n)' },
    code: {
      cpp: `struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};`,
      java: `class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode(int x) { val = x; }\n}`,
      python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right`,
      javascript: `class TreeNode {\n    constructor(val) {\n        this.val = val;\n        this.left = null;\n        this.right = null;\n    }\n}`
    }
  }
};
</script>

<template>
  <div class="h-full w-full p-6 overflow-y-auto custom-scrollbar relative animate-fade-in text-text-primary">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-border-default pb-6">
      <div>
        <h1 class="text-3xl font-black bg-gradient-to-r from-accent-light to-accent-purple bg-clip-text text-transparent mb-2">
          DSA CheatSheet
        </h1>
        <p class="text-text-secondary text-sm">Bảng tra cứu độ phức tạp và Code Snippets theo ngôn ngữ yêu thích của bạn.</p>
      </div>
      <button 
        @click="openLanguageModal"
        class="flex items-center gap-2 px-4 py-2 bg-bg-hover hover:bg-bg-hover border border-border-default rounded-lg transition-colors shadow-sm whitespace-nowrap"
      >
        <BaseIcon name="code-ide" class="w-4 h-4 text-accent" />
        <span class="font-bold text-sm">Ngôn ngữ: {{ currentLang }}</span>
        <BaseIcon name="chevron-down" class="w-4 h-4 text-text-muted" />
      </button>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Left Sidebar: DS Tabs -->
      <div class="lg:col-span-1 glass-panel rounded-xl p-4 h-fit">
        <h3 class="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-2">Cấu trúc dữ liệu</h3>
        <div class="flex flex-col gap-1">
          <button 
            v-for="(data, key) in dsData" 
            :key="key"
            @click="activeTab = key"
            :class="['text-left px-4 py-3 rounded-lg text-sm font-medium transition-all', activeTab === key ? 'bg-accent/20 text-accent border-l-2 border-border-accent' : 'text-text-secondary hover:bg-bg-hover border-l-2 border-transparent']"
          >
            {{ data.title }}
          </button>
        </div>
      </div>

      <!-- Right Content: Details -->
      <div class="lg:col-span-3 flex flex-col gap-6">
        
        <!-- Big-O Table -->
        <div class="glass-panel rounded-xl p-6">
          <h2 class="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <BaseIcon name="zap" class="w-5 h-5 text-accent-green" /> Độ phức tạp thời gian (Big-O)
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-bg-hover text-text-secondary text-sm">
                  <th class="py-3 px-4 rounded-tl-lg font-semibold">Thao tác</th>
                  <th class="py-3 px-4 font-semibold text-accent-green">Trường hợp TB</th>
                  <th class="py-3 px-4 rounded-tr-lg font-semibold text-accent-red">Trường hợp Xấu nhất</th>
                </tr>
              </thead>
              <tbody class="text-sm border-t border-border-default/50">
                <tr class="border-b border-border-default/50 hover:bg-bg-surface transition">
                  <td class="py-3 px-4 text-text-secondary">Truy cập (Access)</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ dsData[activeTab].timeComplexity.access }}</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ dsData[activeTab].timeComplexity.access }}</td>
                </tr>
                <tr class="border-b border-border-default/50 hover:bg-bg-surface transition">
                  <td class="py-3 px-4 text-text-secondary">Tìm kiếm (Search)</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ dsData[activeTab].timeComplexity.search }}</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ dsData[activeTab].timeComplexity.search }}</td>
                </tr>
                <tr class="border-b border-border-default/50 hover:bg-bg-surface transition">
                  <td class="py-3 px-4 text-text-secondary">Chèn (Insertion)</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ dsData[activeTab].timeComplexity.insertion }}</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ dsData[activeTab].timeComplexity.insertion }}</td>
                </tr>
                <tr class="hover:bg-bg-surface transition">
                  <td class="py-3 px-4 text-text-secondary rounded-bl-lg">Xóa (Deletion)</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ dsData[activeTab].timeComplexity.deletion }}</td>
                  <td class="py-3 px-4 font-mono font-bold rounded-br-lg">{{ dsData[activeTab].timeComplexity.deletion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Code Snippet -->
        <div class="glass-panel rounded-xl overflow-hidden flex flex-col">
          <div class="bg-bg-primary px-4 py-3 border-b border-border-default flex justify-between items-center">
            <span class="text-sm font-bold text-text-secondary flex items-center gap-2">
              <BaseIcon name="code-ide" class="w-4 h-4 text-text-secondary" />
              Mẫu Code: {{ currentLang }}
            </span>
            <span class="text-xs text-text-muted font-mono">snippet_{{ activeTab }}.{{ languageStore.currentLanguage }}</span>
          </div>
          <div class="p-6 overflow-x-auto">
            <pre class="text-sm font-mono text-accent-light leading-relaxed"><code v-text="dsData[activeTab].code[languageStore.currentLanguage || 'javascript'] || dsData[activeTab].code['javascript']"></code></pre>
          </div>
        </div>

      </div>
    </div>

    <LanguageSelectorModal />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
