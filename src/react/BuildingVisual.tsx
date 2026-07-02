/**
 * laughtale 시그니처 비주얼 — 진척에 따라 한 층씩 불이 켜지는 5층 건물.
 * 1층은 카페(커피잔 + 피규어), 2~5층은 창문 점등, 100% 달성 시 옥상 깃발.
 * 층당 20%. 채워지는 중인 층은 진행 비율만큼 은은하게 밝아진다.
 */
interface Props {
  progressPct: number;
  className?: string;
}

function floorGlow(progressPct: number, floor: number): number {
  const start = (floor - 1) * 20;
  const frac = Math.min(Math.max((progressPct - start) / 20, 0), 1);
  // 완전 점등 1, 진행 중엔 0.12~0.55 사이로 은은하게
  return frac >= 1 ? 1 : frac > 0 ? 0.12 + frac * 0.43 : 0;
}

function Window({ x, y, glow }: { x: number; y: number; glow: number }) {
  return (
    <g>
      <rect x={x} y={y} width={18} height={20} rx={2} fill="var(--ink)" stroke="var(--mist)" />
      {glow > 0 && (
        <rect x={x + 1.5} y={y + 1.5} width={15} height={17} rx={1.5} fill="var(--brass)" opacity={glow} />
      )}
      <line x1={x + 9} y1={y + 1} x2={x + 9} y2={y + 19} stroke="var(--mist)" strokeWidth={1} />
    </g>
  );
}

export default function BuildingVisual({ progressPct, className }: Props) {
  const p = Math.min(Math.max(progressPct, 0), 100);
  const done = p >= 100;
  const floors = [1, 2, 3, 4, 5].map((f) => floorGlow(p, f));

  return (
    <svg
      viewBox="0 0 220 270"
      role="img"
      aria-label={`목표 진행률 ${p.toFixed(1)}% — 5층 건물 중 ${Math.floor(p / 20)}개 층 점등`}
      className={className}
    >
      {/* 지면 */}
      <line x1={16} y1={252} x2={204} y2={252} stroke="var(--mist)" strokeWidth={2} />

      {/* 건물 본체 */}
      <rect x={50} y={52} width={120} height={200} fill="var(--slate)" stroke="var(--mist)" strokeWidth={2} />
      {/* 옥상 파라펫 */}
      <rect x={44} y={44} width={132} height={10} fill="var(--slate)" stroke="var(--mist)" strokeWidth={2} />

      {/* 옥상 깃발 — 100% 달성 시 */}
      <g opacity={done ? 1 : 0.18}>
        <line x1={110} y1={44} x2={110} y2={16} stroke={done ? 'var(--brass)' : 'var(--mist)'} strokeWidth={2.5} />
        <path
          d="M110 17 L140 23 L110 30 Z"
          fill={done ? 'var(--brass)' : 'var(--mist)'}
        />
      </g>

      {/* 2~5층: 층 구분선 + 창문 2개씩. floor 5 가 최상층 (y 가장 작음) */}
      {[2, 3, 4, 5].map((floor) => {
        const y = 252 - floor * 40; // 층 바닥 y
        const glow = floors[floor - 1];
        return (
          <g key={floor}>
            <line x1={50} y1={y} x2={170} y2={y} stroke="var(--mist)" strokeWidth={1.5} />
            <Window x={70} y={y - 31} glow={glow} />
            <Window x={132} y={y - 31} glow={glow} />
          </g>
        );
      })}

      {/* 1층: 카페 */}
      <g>
        {/* 어닝(차양) */}
        <rect x={54} y={216} width={112} height={9} fill={floors[0] > 0 ? 'var(--brass)' : 'var(--mist)'} opacity={floors[0] > 0 ? 0.85 : 0.6} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={54 + i * 16} y={225} width={8} height={4} rx={1} fill={floors[0] > 0 ? 'var(--brass)' : 'var(--mist)'} opacity={floors[0] > 0 ? 0.85 : 0.6} />
        ))}
        {/* 쇼윈도 */}
        <rect x={60} y={231} width={64} height={21} fill="var(--ink)" stroke="var(--mist)" />
        {floors[0] > 0 && <rect x={61.5} y={232.5} width={61} height={18} fill="var(--brass)" opacity={floors[0] * 0.5} />}
        {/* 쇼윈도 안: 커피잔 + 피규어 실루엣 */}
        <g stroke="var(--cream)" strokeWidth={1.6} fill="none" opacity={floors[0] > 0 ? 0.95 : 0.35}>
          {/* 커피잔 */}
          <path d="M72 241 h10 v6 a5 5 0 0 1 -10 0 z" />
          <path d="M82 242.5 a3 3 0 0 1 0 5" />
          <path d="M75 238.5 q1 -1.5 0 -3 M79 238.5 q1 -1.5 0 -3" strokeWidth={1.1} />
          {/* 피규어(작은 로봇 실루엣) */}
          <rect x={101} y={237} width={9} height={8} rx={1.5} />
          <rect x={103} y={245.5} width={5} height={5.5} rx={1} />
          <circle cx={103.6} cy={240.5} r={0.7} fill="var(--cream)" stroke="none" />
          <circle cx={107.4} cy={240.5} r={0.7} fill="var(--cream)" stroke="none" />
        </g>
        {/* 문 */}
        <rect x={134} y={228} width={22} height={24} fill="var(--ink)" stroke="var(--mist)" />
        <circle cx={151} cy={241} r={1.4} fill={floors[0] > 0 ? 'var(--brass)' : 'var(--mist)'} />
        {/* 간판 */}
        <text
          x={110}
          y={212.5}
          textAnchor="middle"
          fontSize={8.5}
          fontFamily="var(--font-mono)"
          fill={floors[0] > 0 ? 'var(--brass-lt)' : 'var(--muted)'}
          letterSpacing={2}
        >
          CAFE
        </text>
      </g>
    </svg>
  );
}
