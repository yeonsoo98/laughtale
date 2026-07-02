# laughtale

> 광교까지, 20년 — 한 층씩 쌓는 자산 항해 일지

개인 블로그 겸 자산 여정 사이트. Astro + TypeScript + Tailwind CSS 4 + React(아일랜드)로
만든 정적 사이트입니다.

```bash
npm install     # 최초 1회
npm run dev     # 개발 서버 (http://localhost:4321)
npm run build   # 정적 빌드 → dist/
npm run preview # 빌드 결과 미리보기
```

---

## 1. 글 쓰는 법

글은 `src/content/blog/` 폴더의 마크다운(.md/.mdx) 파일입니다. 파일을 넣으면
목록·상세 페이지·RSS·sitemap 에 자동 반영됩니다. **세 가지 방법** 중 편한 걸 쓰세요.

### 방법 A — 글쓰기 스튜디오 (가장 쉬움)

1. `npm run dev` 후 [http://localhost:4321/write](http://localhost:4321/write) 접속.
2. 제목·요약·카테고리를 채우고 마크다운으로 본문 작성 (초안은 브라우저에 자동 저장).
3. **.md 다운로드** → 받은 파일을 `src/content/blog/` 에 넣기 → 커밋.

### 방법 B — 옵시디언에서 쓰기

1. 옵시디언 볼트에 `발행` 폴더를 만들고 거기에 글을 씁니다 (frontmatter 는 아래 형식).
2. 임포트 스크립트 실행:
   ```bash
   node scripts/import-from-obsidian.mjs ~/path/to/vault/발행
   ```
   위키링크(`[[...]]`)는 일반 텍스트로, 첨부 이미지(`![[img.png]]`)는
   `public/images/` 로 복사되며 경로가 자동 변환됩니다.
3. 매번 명령어가 귀찮으면 심볼릭 링크도 가능합니다(단, 위키링크 변환은 안 됨):
   ```bash
   ln -s ~/path/to/vault/발행 src/content/blog/from-obsidian
   ```

### 방법 C — 직접 파일 생성

`src/content/blog/파일명.md` 를 만들고 frontmatter 를 채웁니다.

### frontmatter 형식

```yaml
---
title: "제목"
description: "요약 (검색 결과·미리보기용, 1~2문장)"
pubDate: 2026-07-02
updatedDate: 2026-07-02   # 선택
category: "월간결산"       # 월간결산 | 주식공부 | 자산공부 | 좋은글 중 하나
tags: ["SCHD", "배당"]
draft: false               # true 면 빌드에서 제외
cover: ""                  # 선택
---
```

---

## 2. 자산 대시보드 갱신 (매달 결산 때)

`src/data/journey-data.json` 의 값만 수정하면 홈과 `/journey` 의 건물·진행률이 갱신됩니다.

```json
{
  "updatedAt": "2026-07-01",        // 기준일
  "monthsElapsed": 3,               // 항해 개월차
  "contributionCount": 3,           // 누적 적립 횟수
  "buildingProgressPct": 3.5,       // 빌딩 자기자본 목표 대비 % (건물 점등 기준, 층당 20%)
  "expectedGoalAge": 50,            // 목표 달성 예상 나이
  "buckets": [ { "label": "금융자산", "progressPct": 5 } ]
}
```

**규칙: 이 파일에 원 단위 금액을 절대 넣지 않는다.** 진행률·나이·횟수 같은
상대 지표만 공개합니다.

---

## 3. 배포하는 법 (Cloudflare Pages 무료)

1. GitHub 에 저장소를 만들고 푸시:
   ```bash
   git remote add origin git@github.com:<계정>/laughtale.git
   git push -u origin main
   ```
2. [Cloudflare Pages](https://pages.cloudflare.com) → **Create a project** → GitHub 저장소 연결.
3. 빌드 설정:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
4. 환경변수(Settings → Environment variables)에 `.env.example` 의 변수 설정.
   특히 `PUBLIC_SITE_URL` 을 실제 배포 URL 로.
5. 커스텀 도메인: Pages 프로젝트 → **Custom domains** → 도메인 추가 후 안내대로
   DNS(CNAME) 설정. 도메인 구매 후 `PUBLIC_SITE_URL` 과 `public/robots.txt` 의
   Sitemap URL 도 함께 교체할 것.

> Vercel 도 동일하게 동작합니다 (Import Project → Astro 프리셋 자동 인식).

이후에는 **main 브랜치에 푸시할 때마다 자동 배포**됩니다.
글 발행 = `src/content/blog/` 에 파일 추가 → 커밋 → 푸시. 끝.

---

## 4. 애드센스 연결하는 법

1. 사이트를 배포하고 글이 어느 정도(권장 15~20편+) 쌓이면
   [Google AdSense](https://adsense.google.com) 에 사이트 등록.
   (About·Contact·Privacy 페이지는 이미 준비돼 있음)
2. 승인 후 발급받은 클라이언트 ID 를 환경변수에 설정:
   ```
   PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   ```
   이 변수가 없으면 광고 코드가 아예 렌더링되지 않습니다.
3. `public/ads.txt` 의 주석을 풀고 본인 pub ID 로 교체.
4. 글 상세 페이지에 `<AdSlot />` 이 이미 1개 배치돼 있습니다. 추가하려면
   `src/components/AdSlot.astro` 를 원하는 위치에 넣되 **글당 1~2개까지만**.

**제휴 링크 규칙**: 본문의 제휴 링크에는 반드시 `rel="sponsored nofollow"` 를 붙이고,
글 안에 제휴 링크임을 명시한다.

## 5. 뉴스레터 연결하는 법

1. 스티비(추천)/Buttondown/Beehiiv 등에서 구독 폼을 만들고 폼의 action URL 복사.
2. 환경변수 설정:
   ```
   PUBLIC_NEWSLETTER_ACTION=https://...폼주소
   ```
   비워두면 mailto 폴백으로 동작합니다.
3. 더블 옵트인(확인 메일)과 환영 메일을 서비스 쪽에서 켜두는 것을 권장.

---

## 프로젝트 구조

```
src/
├─ components/    # Header, Footer, PostCard, NewsletterCTA, AdSlot ...
├─ layouts/       # BaseLayout (SEO 메타·JSON-LD·테마 포함)
├─ pages/         # 홈, blog/, journey, about, contact, privacy, toolkit, write, 404, rss.xml
├─ react/         # React 아일랜드: JourneyDashboard, BuildingVisual, WriteStudio
├─ content/blog/  # ★ 글은 전부 여기
├─ data/          # journey-data.json (대시보드 공개 지표)
└─ styles/        # global.css — 디자인 토큰(@theme)과 본문(.prose) 스타일
scripts/
└─ import-from-obsidian.mjs
```

### 디자인 토큰

Tailwind CSS 4 를 사용하므로 `tailwind.config` 파일 대신
`src/styles/global.css` 의 `@theme` 블록에 토큰이 정의돼 있습니다
(`--ink`, `--slate`, `--mist`, `--brass`, `--brass-lt`, `--sage`, `--cream`, `--muted`).
다크(기본)/라이트 값이 CSS 변수로 분리돼 있어 색만 바꾸면 전체에 반영됩니다.

### 카테고리 추가/변경

`src/content.config.ts` 의 `CATEGORIES` 를 수정하면 스키마 검증·필터에 반영됩니다.
글쓰기 스튜디오(`src/react/WriteStudio.tsx`)의 목록도 함께 수정할 것.
