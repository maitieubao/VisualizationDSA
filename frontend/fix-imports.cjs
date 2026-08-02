const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

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

// Map of old feature names to new feature names (just the folder name part)
const featureMoveMap = {
  'gamification-engine': 'gamification/gamification-engine',
  'user-progress': 'gamification/user-progress',
  'algorithm-sandbox': 'core-learning/algorithm-sandbox',
  'animation-engine': 'core-learning/animation-engine',
  'code-editor': 'core-learning/code-editor',
  'code-to-visualization': 'core-learning/code-to-visualization',
  'custom-input': 'core-learning/custom-input',
  'interactive-playground': 'core-learning/interactive-playground',
  'pseudocode-sync': 'core-learning/pseudocode-sync',
  'quiz': 'core-learning/quiz',
  'quiz-system': 'core-learning/quiz-system',
  'smart-quiz': 'core-learning/smart-quiz',
  'realtime': 'core-learning/realtime',
  'vcr-player': 'core-learning/vcr-player',
  'dsa-modules': 'dsa/dsa-modules',
  'graph': 'dsa/graph',
  'oop-visualization': 'oop/oop-visualization',
  'solid-visualization': 'solid/solid-visualization',
  'di-sandbox': 'solid/di-sandbox',
  'system-design-viz': 'system-design/system-design-viz',
};

walkSync(srcDir, (filepath) => {
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.vue')) return;

    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // We look for import ... from '...'
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    
    content = content.replace(importRegex, (match, importPath) => {
        // Only fix relative paths that go up (e.g., '../')
        if (importPath.startsWith('.')) {
            // Because we moved the files one folder deeper, the OLD relative path in the file 
            // actually corresponds to what it was BEFORE moving.
            // Wait, we already moved the files! So `__dirname` and file paths reflect the NEW locations.
            // But the contents still have the old `../../` which might now be pointing to the wrong place.
            // Actually, since we moved them 1 level deeper (e.g., from `features/graph` to `features/dsa/graph`),
            // any `../../` that meant to go out of `features/` will now only reach `features/`.
            // Let's resolve the path by ASSUMING it was 1 level shallower previously? No, that's complex.
            
            // Let's just fix known broken paths instead by replacing text patterns globally.
            return match;
        }
        return match;
    });

    // Actually, simple string replacements are much safer for the known broken things:
    
    // 1. Fixing `../../animation-engine` from `dsa-modules` etc (it was siblings).
    // Now they are both in their respective folders.
    // If we just replace `../../animation-engine` with `@/features/core-learning/animation-engine`
    content = content.replace(/['"]\.\.\/\.\.\/animation-engine\//g, "'@/features/core-learning/animation-engine/");
    
    // 2. Fixing `../../../shared` in oop, solid, system-design which moved 1 level deeper.
    // Wait, let's just replace any `../../` or `../../../` that ends up in shared with `@/shared`
    // Actually, any relative import to `shared`, `components`, `utils`, `services` can be converted to `@/...`
    content = content.replace(/['"](\.\.\/)+shared\//g, "'@/shared/");
    content = content.replace(/['"](\.\.\/)+components\//g, "'@/components/");
    content = content.replace(/['"](\.\.\/)+utils\//g, "'@/utils/");
    content = content.replace(/['"](\.\.\/)+services\//g, "'@/services/");
    content = content.replace(/['"](\.\.\/)+composables\//g, "'@/composables/");
    content = content.replace(/['"](\.\.\/)+types\//g, "'@/types/");
    
    // 3. guided-tour is deleted.
    if (content.includes('guided-tour')) {
        // Just remove the import entirely
        content = content.replace(/import\s+.*?from\s+['"].*?guided-tour.*?['"];?/g, '');
        // Also remove <HelpButton /> usage
        content = content.replace(/<HelpButton\s*[^>]*\/>/g, '');
    }

    // 4. gamification-engine fixes
    content = content.replace(/['"]\.\.\/\.\.\/gamification-engine\//g, "'@/features/gamification/gamification-engine/");
    content = content.replace(/['"]\.\.\/\.\.\/auth\//g, "'@/features/auth/");

    // 5. Some specific auth imports from gamification-engine
    content = content.replace(/['"]\.\.\/\.\.\/auth\/store\/useAuthStore['"]/g, "'@/features/auth/store/useAuthStore'");
    
    if (content !== fs.readFileSync(filepath, 'utf8')) {
        console.log(`Fixed imports in ${filepath}`);
        fs.writeFileSync(filepath, content, 'utf8');
    }
});

console.log("Imports fixed.");
