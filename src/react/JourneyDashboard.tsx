/**
 * 자산 여정 대시보드 — 공개 모드.
 * 원 단위 절대 금액은 절대 표시하지 않는다.
 * 공개 지표: 진행률(%), 건물 점등, 목표 달성 예상 나이, 개월차/적립 횟수, 버킷 라벨+진행률.
 * 데이터: src/data/journey-data.json (민감하지 않은 값만 담을 것)
 */
import BuildingVisual from './BuildingVisual';
import journey from '../data/journey-data.json';

interface Props {
  compact?: boolean;
}

function Stat({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="rounded border border-mist bg-ink/60 px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-xl font-bold text-cream">
        {value}
        {unit && <span className="ml-0.5 text-sm font-medium text-muted">{unit}</span>}
      </dd>
    </div>
  );
}

export default function JourneyDashboard({ compact = false }: Props) {
  const p = journey.buildingProgressPct;

  return (
    <section
      aria-label="자산 여정 대시보드 (공개 모드)"
      className="rounded-lg border border-mist bg-slate p-5 sm:p-7"
    >
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-brass">
          꼬마빌딩 항해 일지
        </h2>
        <p className="font-mono text-xs text-muted">
          {journey.updatedAt} 기준 · {journey.monthsElapsed}개월차
        </p>
      </header>

      <div className={compact ? 'flex flex-col items-center gap-6 sm:flex-row' : 'flex flex-col items-center gap-8 md:flex-row'}>
        <div className="w-44 shrink-0 sm:w-52">
          <BuildingVisual progressPct={p} className="w-full" />
        </div>

        <div className="w-full flex-1">
          {/* 핵심 진행률 */}
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm text-muted">빌딩 자기자본 목표 대비</span>
            <span className="font-mono text-3xl font-bold text-brass">
              {p.toFixed(1)}
              <span className="text-base text-muted">%</span>
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-ink"
            role="progressbar"
            aria-valuenow={p}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="빌딩 자기자본 목표 진행률"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brass to-brass-lt transition-[width] duration-700"
              style={{ width: `${Math.min(p, 100)}%` }}
            />
          </div>

          {!compact && (
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="목표 달성 예상 나이" value={journey.expectedGoalAge} unit="세" />
              <Stat label="항해 개월차" value={journey.monthsElapsed} unit="개월" />
              <Stat label="누적 적립 횟수" value={journey.contributionCount} unit="회" />
            </dl>
          )}

          {/* 3버킷 — 라벨과 진행률만, 금액 없음 */}
          <div className="mt-5 space-y-2.5">
            {journey.buckets.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted">{b.label}</span>
                  <span className="font-mono text-sage">{b.progressPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink">
                  <div
                    className="h-full rounded-full bg-sage/80"
                    style={{ width: `${Math.min(b.progressPct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 border-t border-mist/60 pt-3 text-xs leading-relaxed text-muted">
        금액은 공개하지 않습니다. 이 대시보드는 목표 대비 진행률과 시간의 흐름만 기록합니다 —
        {journey.startAge}세에 출항, {journey.goalAge}세 도착 예정.
      </p>
    </section>
  );
}
