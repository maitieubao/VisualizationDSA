const fs = require('fs');
const path = require('path');

const map = {
  // gamification
  'gamification-engine': 'gamification/gamification-engine',
  'user-progress': 'gamification/user-progress',
  // core-learning
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
  // dsa
  'dsa-modules': 'dsa/dsa-modules',
  'graph': 'dsa/graph',
  // oop
  'oop-visualization': 'oop/oop-visualization',
  // solid
  'solid-visualization': 'solid/solid-visualization',
  'di-sandbox': 'solid/di-sandbox',
  // system-design
  'system-design-viz': 'system-design/system-design-viz',
};

const srcDir = path.join(__dirname, 'src');
const featuresDir = path.join(srcDir, 'features');

// 1. Move folders
for (const [oldName, newPath] of Object.entries(map)) {
    const oldDir = path.join(featuresDir, oldName);
    const newDir = path.join(featuresDir, newPath);
    
    if (fs.existsSync(oldDir)) {
        console.log(`Moving ${oldName} to ${newPath}`);
        fs.mkdirSync(path.dirname(newDir), { recursive: true });
        // Use rename to move
        try {
            fs.renameSync(oldDir, newDir);
        } catch (e) {
            console.error(`Failed to move ${oldName}: ${e.message}`);
        }
    }
}

// 2. Update imports
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

walkSync(srcDir, (filepath) => {
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.vue')) return;

    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    for (const [oldName, newPath] of Object.entries(map)) {
        // Regex to replace 'features/oldName' with 'features/newPath'
        const regex = new RegExp(`features/${oldName}`, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, `features/${newPath}`);
            modified = true;
        }
    }

    if (modified) {
        console.log(`Updated imports in ${filepath}`);
        fs.writeFileSync(filepath, content, 'utf8');
    }
});

console.log("Refactoring complete.");
