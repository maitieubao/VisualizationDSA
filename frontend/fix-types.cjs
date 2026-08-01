const fs = require('fs');
const path = require('path');

function walkSync(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath, callback);
        } else {
            callback(filepath);
        }
    }
}

walkSync(path.join(__dirname, 'src'), (filepath) => {
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.vue')) return;
    let content = fs.readFileSync(filepath, 'utf8');
    const oldContent = content;

    const replacements = {
        '@/services/statelessAuthApi': '@/features/auth/services/statelessAuthApi',
        '@/services/authApi': '@/features/auth/services/authApi',
        '@/composables/useAlgorithmCanvasController': '@/features/core-learning/algorithm-sandbox/composables/useAlgorithmCanvasController',
        '@/composables/useSortingAnimation': '@/features/core-learning/algorithm-sandbox/composables/useSortingAnimation',
        '@/composables/useInputValidation': '@/features/core-learning/custom-input/composables/useInputValidation',
        '@/composables/useGraphPlayground': '@/features/core-learning/algorithm-sandbox/composables/useGraphPlayground',
    };

    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`['"]${key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}['"]`, 'g');
        content = content.replace(regex, `'${value}'`);
    }
    
    // Auth ApiError fix
    if (filepath.includes('authApi.ts') || filepath.includes('statelessAuthApi.ts')) {
         content = content.replace(/import\s+{\s*ApiError\s*}\s+from/g, 'import type { ApiError } from');
    }
    
    // global in __tests__
    if (filepath.includes('__tests__') || filepath.includes('.spec.ts')) {
         content = content.replace(/global\s*,\s*['"]fetch['"]/g, `globalThis, 'fetch'`);
    }

    if (content !== oldContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed ${filepath}`);
    }
});
console.log('Done');
