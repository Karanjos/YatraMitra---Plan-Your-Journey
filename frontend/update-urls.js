const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('c:/Users/Karan Joshi/Desktop/final_projects/Devops/YatraMitra---Plan-Your-Journey/frontend/src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Check if it needs the import
        if ((content.includes('http://localhost:5000/api') || content.includes('${API_URL}')) && !content.includes("import { API_URL }")) {
            // Find the last import statment
            const lines = content.split('\n');
            let lastImportIdx = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    lastImportIdx = i;
                }
            }
            if (lastImportIdx !== -1) {
                lines.splice(lastImportIdx + 1, 0, "import { API_URL } from '@/lib/config';");
                content = lines.join('\n');
            } else {
                content = "import { API_URL } from '@/lib/config';\n" + content;
            }
            modified = true;
        }

        // 2. Replace hardcoded strings inside standard quotes: 'http://localhost:5000/api/...' -> `${API_URL}/...`
        if (content.includes("'http://localhost:5000/api")) {
            content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`${API_URL}$1`');
            modified = true;
        }

        // 3. Replace hardcoded strings inside backticks: `http://localhost:5000/api/...` -> `${API_URL}/...`
        if (content.includes("http://localhost:5000/api")) {
            content = content.replace(/http:\/\/localhost:5000\/api/g, '${API_URL}');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log("Updated", filePath);
        }
    }
});
