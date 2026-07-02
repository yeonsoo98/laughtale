/**
 * 글쓰기 스튜디오 — 브라우저에서 블로그 글을 쓰는 페이지.
 * frontmatter 를 폼으로 입력하고 마크다운을 쓰면, 실시간 미리보기와 함께
 * 완성된 .md 파일을 다운로드/복사할 수 있다. 받은 파일을 src/content/blog/ 에
 * 넣으면 그대로 발행된다. 초안은 localStorage 에 자동 저장된다.
 */
import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';

const CATEGORIES = ['월간결산', '주식공부', '자산공부', '좋은글'] as const;
const STORAGE_KEY = 'laughtale-write-draft';

interface Draft {
  title: string;
  description: string;
  category: string;
  tags: string;
  slug: string;
  body: string;
}

const EMPTY: Draft = {
  title: '',
  description: '',
  category: '월간결산',
  tags: '',
  slug: '',
  body: '',
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildMarkdown(d: Draft): string {
  const tags = d.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return [
    '---',
    `title: "${d.title.replace(/"/g, '\\"')}"`,
    `description: "${d.description.replace(/"/g, '\\"')}"`,
    `pubDate: ${today()}`,
    `category: "${d.category}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
    'draft: false',
    '---',
    '',
    d.body,
    '',
  ].join('\n');
}

function suggestSlug(d: Draft): string {
  if (d.slug.trim()) return d.slug.trim();
  const ascii = d.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return ascii || 'untitled';
}

const inputCls =
  'w-full rounded border border-mist bg-ink px-3 py-2 text-sm text-cream placeholder:text-muted/60';
const labelCls = 'mb-1 block text-xs font-semibold text-muted';

export default function WriteStudio() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  // 초안 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDraft({ ...EMPTY, ...JSON.parse(saved) });
        setRestored(true);
      }
    } catch {
      /* 무시 */
    }
  }, []);

  // 자동 저장 (0.5초 디바운스)
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 500);
    return () => clearTimeout(t);
  }, [draft]);

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  const md = useMemo(() => buildMarkdown(draft), [draft]);
  const previewHtml = useMemo(() => marked.parse(draft.body || '*본문을 입력하면 여기에 미리보기가 표시됩니다.*') as string, [draft.body]);
  const filename = `${today()}-${suggestSlug(draft)}.md`;
  const ready = draft.title.trim() && draft.description.trim() && draft.body.trim();

  function download() {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function reset() {
    if (confirm('작성 중인 초안을 지울까요?')) {
      setDraft(EMPTY);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <div className="space-y-5">
      {restored && (
        <p className="rounded border border-sage/40 bg-slate px-3 py-2 text-xs text-sage">
          저장돼 있던 초안을 불러왔습니다. 초안은 이 브라우저에 자동 저장됩니다.
        </p>
      )}

      {/* frontmatter 폼 */}
      <div className="grid gap-4 rounded-lg border border-mist bg-slate p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="w-title">제목 *</label>
          <input id="w-title" className={inputCls} value={draft.title} onChange={set('title')} placeholder="예: 2026년 7월 결산 — 3개월차, 1층에 첫 불빛" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="w-desc">요약 (검색·미리보기용 1~2문장) *</label>
          <input id="w-desc" className={inputCls} value={draft.description} onChange={set('description')} placeholder="이 글이 무엇을 다루는지 한두 문장으로" />
        </div>
        <div>
          <label className={labelCls} htmlFor="w-cat">카테고리</label>
          <select id="w-cat" className={inputCls} value={draft.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="w-tags">태그 (쉼표로 구분)</label>
          <input id="w-tags" className={inputCls} value={draft.tags} onChange={set('tags')} placeholder="SCHD, 배당" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="w-slug">파일명 슬러그 (선택 — 영문 권장, 비우면 제목에서 생성)</label>
          <input id="w-slug" className={inputCls} value={draft.slug} onChange={set('slug')} placeholder="july-2026-review" />
        </div>
      </div>

      {/* 에디터 / 미리보기 탭 */}
      <div>
        <div className="mb-3 flex gap-2" role="tablist" aria-label="편집 모드">
          {(['write', 'preview'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                tab === t ? 'bg-brass font-semibold text-ink' : 'border border-mist text-muted hover:text-cream'
              }`}
            >
              {t === 'write' ? '쓰기' : '미리보기'}
            </button>
          ))}
          <span className="ml-auto self-center font-mono text-xs text-muted">
            {draft.body.length.toLocaleString()}자
          </span>
        </div>

        {tab === 'write' ? (
          <textarea
            aria-label="본문 (마크다운)"
            className={`${inputCls} min-h-[420px] resize-y font-mono leading-relaxed`}
            value={draft.body}
            onChange={set('body')}
            placeholder={'## 이번 달 요약\n\n마크다운으로 자유롭게 쓰세요...'}
          />
        ) : (
          <div
            className="prose min-h-[420px] rounded border border-mist bg-slate p-6"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>

      {/* 내보내기 */}
      <div className="rounded-lg border border-mist bg-slate p-5">
        <p className="mb-3 font-mono text-xs text-muted">
          내보낼 파일: <span className="text-cream">{filename}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={download}
            disabled={!ready}
            className="rounded bg-brass px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brass-lt disabled:cursor-not-allowed disabled:opacity-40"
          >
            .md 다운로드
          </button>
          <button
            onClick={copy}
            disabled={!ready}
            className="rounded border border-mist px-5 py-2.5 text-sm text-cream transition-colors hover:border-brass disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? '복사됨 ✓' : '전체 복사'}
          </button>
          <button
            onClick={reset}
            className="ml-auto rounded border border-mist px-4 py-2.5 text-sm text-muted transition-colors hover:text-cream"
          >
            초안 지우기
          </button>
        </div>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-muted">
          <li>다운로드한 .md 파일을 프로젝트의 <code className="text-cream">src/content/blog/</code> 폴더에 넣는다.</li>
          <li>커밋하고 푸시하면 자동으로 배포된다.</li>
          <li>옵시디언에서 쓰는 걸 선호하면 README 의 옵시디언 워크플로를 참고.</li>
        </ol>
      </div>
    </div>
  );
}
