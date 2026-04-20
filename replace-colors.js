const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src', 'app', 'pages', 'Home.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of bg-yellow-400 with bg-[#FADA00]
content = content.replace(/bg-yellow-400/g, 'bg-[#FADA00]');

// Replace all instances of text-yellow-400 with text-[#FADA00]
content = content.replace(/text-yellow-400/g, 'text-[#FADA00]');

// Replace rgba(250,204,21 with rgba(250,218,0
content = content.replace(/rgba\(250,204,21/g, 'rgba(250,218,0');

// Replace rgba(250, 204, 21 with rgba(250, 218, 0
content = content.replace(/rgba\(250, 204, 21/g, 'rgba(250, 218, 0');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Replaced all yellow-400 colors with #FADA00');
console.log('✅ Replaced all rgba(250,204,21) with rgba(250,218,0)');
