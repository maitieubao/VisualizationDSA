import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mermaid from 'mermaid';
import { JSDOM } from 'jsdom';

const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;

mermaid.initialize({ startOnLoad: false });

let hasError = false;

async function checkFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await checkFiles(fullPath);
        } else if (fullPath.endsWith('.md')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            let inMermaid = false;
            let currentBlock = [];
            let startLine = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim() === '```mermaid') {
                    inMermaid = true;
                    startLine = i + 1;
                    currentBlock = [];
                } else if (inMermaid && line.trim() === '```') {
                    inMermaid = false;
                    const code = currentBlock.join('\n');
                    try {
                        await mermaid.parse(code);
                    } catch (e) {
                        hasError = true;
                        console.error(`Syntax error in ${fullPath} at block starting line ${startLine}`);
                        console.error(e.message.split('\n').slice(0, 5).join('\n'));
                        console.error('---');
                    }
                } else if (inMermaid) {
                    currentBlock.push(line);
                }
            }
        }
    }
}

checkFiles(path.join(process.cwd(), 'src/features/docs/content'))
    .then(() => {
        if (!hasError) {
            console.log("No syntax errors found!");
        }
    })
    .catch(console.error);
