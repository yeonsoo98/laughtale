#!/usr/bin/env node
/**
 * 옵시디언 → laughtale 임포트 스크립트
 *
 * 옵시디언 볼트의 "발행" 폴더에 있는 .md 파일을 src/content/blog/ 로 복사하면서
 *  1. 위키링크 [[문서]] / [[문서|표시명]] → 일반 텍스트(표시명)로 변환
 *  2. 옵시디언 임베드 ![[이미지.png]] → ![](/images/이미지.png) 로 변환하고
 *     첨부 파일을 public/images/ 로 복사
 *  3. frontmatter 필수 필드(title, description, pubDate, category) 누락 시 경고
 *
 * 사용법:
 *   node scripts/import-from-obsidian.mjs <옵시디언_발행_폴더_경로>
 * 예:
 *   node scripts/import-from-obsidian.mjs ~/Documents/vault/발행
 */
import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_FIELDS = ['title', 'description', 'pubDate', 'category'];
const CATEGORIES = ['월간결산', '주식공부', '자산공부', '좋은글'];

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('사용법: node scripts/import-from-obsidian.mjs <옵시디언_발행_폴더_경로>');
  process.exit(1);
}
const vaultDir = path.resolve(srcDir);
if (!fs.existsSync(vaultDir)) {
  console.error(`폴더를 찾을 수 없습니다: ${vaultDir}`);
  process.exit(1);
}

const projectRoot = path.resolve(import.meta.dirname, '..');
const blogDir = path.join(projectRoot, 'src/content/blog');
const imagesDir = path.join(projectRoot, 'public/images');
fs.mkdirSync(blogDir, { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });

/** 볼트 전체에서 첨부 파일을 찾는다 (옵시디언은 첨부 위치가 유동적) */
function findAttachment(name) {
  const stack = [vaultDir, path.dirname(vaultDir)];
  const seen = new Set();
  while (stack.length) {
    const dir = stack.pop();
    if (seen.has(dir)) continue;
    seen.add(dir);
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.isFile() && e.name === name) return path.join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith('.')) stack.push(path.join(dir, e.name));
    }
  }
  return null;
}

function convert(md, fileName) {
  const warnings = [];

  // frontmatter 검사
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    warnings.push('frontmatter 가 없습니다 — 발행 시 빌드 에러가 납니다.');
  } else {
    for (const field of REQUIRED_FIELDS) {
      if (!new RegExp(`^${field}\\s*:`, 'm').test(fmMatch[1])) {
        warnings.push(`frontmatter 에 "${field}" 가 없습니다.`);
      }
    }
    const cat = fmMatch[1].match(/^category\s*:\s*["']?([^"'\n]+)["']?/m);
    if (cat && !CATEGORIES.includes(cat[1].trim())) {
      warnings.push(`category "${cat[1].trim()}" 는 허용 목록(${CATEGORIES.join(', ')})에 없습니다.`);
    }
  }

  // 이미지 임베드: ![[img.png]] 또는 ![[img.png|alt]]
  md = md.replace(/!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, file, alt) => {
    const name = file.trim();
    const found = findAttachment(name);
    if (found) {
      fs.copyFileSync(found, path.join(imagesDir, name));
      console.log(`  🖼  첨부 복사: ${name}`);
    } else {
      warnings.push(`첨부 파일을 찾지 못했습니다: ${name}`);
    }
    return `![${alt?.trim() || name}](/images/${encodeURI(name)})`;
  });

  // 위키링크: [[문서|표시명]] → 표시명, [[문서]] → 문서
  md = md.replace(/\[\[([^\]|]+?)\|([^\]]+?)\]\]/g, '$2');
  md = md.replace(/\[\[([^\]]+?)\]\]/g, '$1');

  if (warnings.length) {
    console.warn(`  ⚠ ${fileName}:`);
    for (const w of warnings) console.warn(`     - ${w}`);
  }
  return md;
}

const files = fs.readdirSync(vaultDir).filter((f) => f.endsWith('.md'));
if (files.length === 0) {
  console.log('임포트할 .md 파일이 없습니다.');
  process.exit(0);
}

console.log(`${files.length}개 파일 임포트 시작 → src/content/blog/\n`);
for (const file of files) {
  const raw = fs.readFileSync(path.join(vaultDir, file), 'utf-8');
  const converted = convert(raw, file);
  fs.writeFileSync(path.join(blogDir, file), converted);
  console.log(`  ✓ ${file}`);
}
console.log('\n완료. npm run dev 로 확인한 뒤 커밋하세요.');
