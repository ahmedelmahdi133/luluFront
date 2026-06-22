import fs from 'fs';
import path from 'path';

const directoryPath = 'c:/Users/aelma/Desktop/lulu/frontend/src/pages/customer';
const authPath = 'c:/Users/aelma/Desktop/lulu/frontend/src/pages';
const layoutPath = 'c:/Users/aelma/Desktop/lulu/frontend/src/components/layouts';

const replaceColorsInFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace blue with teal
    content = content.replace(/blue-([0-9]+)/g, 'teal-$1');
    // Replace indigo with emerald
    content = content.replace(/indigo-([0-9]+)/g, 'teal-$1');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated colors in ${filePath}`);
};

const processDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            // don't recurse deep
        } else if (file.endsWith('.jsx')) {
            replaceColorsInFile(filePath);
        }
    });
};

processDirectory(directoryPath);
replaceColorsInFile(path.join(authPath, 'Login.jsx'));
replaceColorsInFile(path.join(layoutPath, 'CustomerLayout.jsx'));

console.log('Done replacing colors.');
