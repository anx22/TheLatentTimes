import fs from 'fs';
import path from 'path';

function replaceInDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  if (!fs.statSync(dir).isDirectory()) {
    return;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/bg-zinc-900\/\d+/g, 'bg-zinc-900');
      content = content.replace(/bg-white\/10/g, 'bg-zinc-800');
      content = content.replace(/bg-white\/5/g, 'bg-zinc-900');
      content = content.replace(/border-white\/5/g, 'border-zinc-700');
      content = content.replace(/border-white\/20/g, 'border-zinc-600');
      content = content.replace(/border-white\/10/g, 'border-zinc-700');
      content = content.replace(/bg-zinc-800\/80/g, 'bg-zinc-800');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./components');
replaceInDir('./App.tsx');


