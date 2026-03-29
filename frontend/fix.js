const fs = require('fs');
const path = require('path');

const dir = './src';

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk(dir);
let changedFiles = 0;

files.forEach(file => {
   let content = fs.readFileSync(file, 'utf8');
   const originalContent = content;
   
   content = content.replace(/bg-\[var\(--primary\)\]/g, 'bg-(--primary)');
   content = content.replace(/text-\[var\(--secondary\)\]/g, 'text-(--secondary)');
   content = content.replace(/text-\[var\(--primary\)\]/g, 'text-(--primary)');
   content = content.replace(/focus:ring-\[var\(--primary\)\]/g, 'focus:ring-(--primary)');
   content = content.replace(/bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\]/g, 'bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))]');
   content = content.replace(/flex-shrink-0/g, 'shrink-0');
   
   if (content !== originalContent) {
       fs.writeFileSync(file, content, 'utf8');
       changedFiles++;
       console.log('Fixed:', file);
   }
});

console.log('Total files fixed:', changedFiles);
