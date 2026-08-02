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
    
    // Replace '@/.../..." with '@/.../...' (fix mismatched quotes)
    const regex1 = /('@\/[^'"]+)"/g;
    const regex2 = /("@\/[^'"]+)'/g;
    const regex3 = /('@\/[^'"]+)`/g;

    let modified = false;
    if (regex1.test(content) || regex2.test(content) || regex3.test(content)) {
        content = content.replace(regex1, "$1'");
        content = content.replace(regex2, '$1"');
        content = content.replace(regex3, "$1'");
        modified = true;
    }

    if (modified) {
        console.log(`Fixed quotes in ${filepath}`);
        fs.writeFileSync(filepath, content, 'utf8');
    }
});
