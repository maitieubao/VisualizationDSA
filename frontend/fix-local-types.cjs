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

walkSync(srcDir, (filepath) => {
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.vue')) return;

    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    if (content.includes('@/shared/types/solid-visualization.types')) {
        content = content.replace(/@\/shared\/types\/solid-visualization\.types/g, '../types/solid-visualization.types');
        modified = true;
    }
    
    if (content.includes('@/shared/types/system-design-viz.types')) {
        content = content.replace(/@\/shared\/types\/system-design-viz\.types/g, '../types/system-design-viz.types');
        modified = true;
    }

    if (content.includes('tourStore')) {
        content = content.replace(/.*tourStore.*\n/g, '');
        modified = true;
    }

    if (content.includes('OOPVisualizationView')) {
        // Only if it's the import or usage in LessonStudyView
        if (filepath.endsWith('LessonStudyView.vue')) {
            content = content.replace(/.*OOPVisualizationView.*\n/g, '');
            modified = true;
        }
    }

    if (modified) {
        console.log(`Fixed in ${filepath}`);
        fs.writeFileSync(filepath, content, 'utf8');
    }
});
