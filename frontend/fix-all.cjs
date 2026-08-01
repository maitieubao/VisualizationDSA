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

    // Fix oop types
    if (content.includes('@/shared/types/oop-visualization.types')) {
        content = content.replace(/@\/shared\/types\/oop-visualization\.types/g, '../types/oop-visualization.types');
        modified = true;
    }
    
    if (content.includes('@/shared/types/gamification.types')) {
        content = content.replace(/@\/shared\/types\/gamification\.types/g, '../types/gamification.types');
        modified = true;
    }

    // Fix API imports that were wrongly moved to @/services/
    // paymentApi
    if (content.includes('@/services/paymentApi')) {
        content = content.replace(/@\/services\/paymentApi/g, '../services/paymentApi');
        modified = true;
    }
    if (content.includes('@/services/statelessPaymentApi')) {
        content = content.replace(/@\/services\/statelessPaymentApi/g, '../services/statelessPaymentApi');
        modified = true;
    }
    
    // diContainerApi
    if (content.includes('@/services/diContainerApi')) {
        content = content.replace(/@\/services\/diContainerApi/g, '../services/diContainerApi');
        modified = true;
    }
    
    // solidApi
    if (content.includes('@/services/solidApi')) {
        content = content.replace(/@\/services\/solidApi/g, '../services/solidApi');
        modified = true;
    }
    
    // oopApi
    if (content.includes('@/services/oopApi')) {
        content = content.replace(/@\/services\/oopApi/g, '../services/oopApi');
        modified = true;
    }
    
    // tourStore leftovers
    if (content.includes('tourStore')) {
        content = content.replace(/.*tourStore.*\n/g, '');
        modified = true;
    }

    // fix never assignment
    if (content.includes('as never')) {
        // do nothing
    } else if (content.includes('Argument of type \'number\' is not assignable to parameter of type \'never\'')) {
        // will fix manually
    }
    
    if (filepath.endsWith('LessonStudyView.vue') && content.includes('OOPVisualizationView.vue')) {
        content = content.replace(/import OOPVisualizationView from '\.\/OOPVisualizationView\.vue';\n/g, '');
        modified = true;
    }

    if (modified) {
        console.log(`Fixed in ${filepath}`);
        fs.writeFileSync(filepath, content, 'utf8');
    }
});
