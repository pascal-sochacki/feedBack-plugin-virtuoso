import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../assets/practices/', import.meta.url);
async function walk(dir) {
  const rows = [];
  for (const item of await readdir(dir, {withFileTypes:true})) {
    const path = join(dir, item.name);
    if (item.isDirectory()) rows.push(...await walk(path));
    else if (item.isFile() && item.name.endsWith('.md')) rows.push(path);
  }
  return rows;
}
const practices = [];
for (const file of await walk(root.pathname)) {
  const source = await readFile(file, 'utf8');
  const meta = Object.fromEntries(source.match(/^---\n([\s\S]*?)\n---/)[1].split('\n').map(line => {
    const split = line.indexOf(':'); return [line.slice(0,split), line.slice(split+1).trim()];
  }));
  const body = source.slice(source.indexOf('```json') + 7);
  const data = JSON.parse(body.slice(0,body.indexOf('```')).trim());
  const use = data.block ? 'block' : data.pathway ? 'pathway' : 'custom';
  practices.push({id:meta.id,title:meta.title,path:relative(root.pathname,file).split('\\').join('/'),use});
}
practices.sort((a,b)=>a.path.localeCompare(b.path));
await writeFile(new URL('../assets/practices/index.json', import.meta.url), `${JSON.stringify({practices},null,2)}\n`);
