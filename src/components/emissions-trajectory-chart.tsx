import {
  glidePathStartYearFromActions,
  projectedAnnualEmissionsTonsForYear,
} from "@/lib/calculations";
import type { CityProfile } from "@/lib/schemas";
import { useId } from "react";

const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Y-axis cap hint for readability (kept outside the clipped plot so the stroke never crosses it). */
function formatCompactTonsPerYear(tons: number): string {
  const abs = Math.abs(tons);
  if (abs >= 1_000_000) {
    const v = tons / 1_000_000;
    const s = v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10).replace(/\.0$/, "");
    return `${s}M t/y`;
  }
  if (abs >= 10_000) {
    const v = tons / 1000;
    const s =
      v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10).replace(/\.0$/, "");
    return `${s}k t/y`;
  }
  return `${num.format(tons)} t/y`;
}

type Props = {
  profile: CityProfile;
};

/**
 * Lightweight SVG trajectory (stretch): linear glide of inventoried baseline → 0 by net-zero year.
 * Palette: brand blue field + neon spring-green stroke per DESIGN_SYSTEM.
 */
export function EmissionsTrajectoryChart({ profile }: Props) {
  const plotClipId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const glideStart = glidePathStartYearFromActions(
    profile.actions,
    profile.targetYear,
  );
  const baseline = profile.baselineEmissions;
  const targetYear = profile.targetYear;
  const calendarYear = new Date().getFullYear();

  const points: { year: number; tons: number }[] = [];
  for (let y = glideStart; y <= targetYear; y++) {
    points.push({
      year: y,
      tons: projectedAnnualEmissionsTonsForYear(
        baseline,
        glideStart,
        targetYear,
        y,
      ),
    });
  }

  if (points.length < 2) {
    return null;
  }

  const minYear = points[0]!.year;
  const maxYear = points[points.length - 1]!.year;
  const spanYears = Math.max(1, maxYear - minYear);
  const maxTons = baseline;

  const vbW = 100;
  const vbH = 64;
  /** Left inset: year + zero labels sit on the plot edge; no Y-max glyph on the canvas. */
  const labelGutter = 6;
  const padL = 4;
  const padR = 6;
  const padT = 10;
  const padB = 16;
  const chartLeft = padL + labelGutter;
  const innerW = vbW - chartLeft - padR;
  const innerH = vbH - padT - padB;

  const project = (year: number, tons: number) => {
    const x = chartLeft + ((year - minYear) / spanYears) * innerW;
    const yNorm = maxTons > 0 ? tons / maxTons : 0;
    const y = padT + (1 - yNorm) * innerH;
    return { x, y };
  };

  const linePoints = points.map((p) => {
    const { x, y } = project(p.year, p.tons);
    return `${x},${y}`;
  });
  const line = linePoints.join(" ");

  const areaBase = padT + innerH;
  const firstPt = project(points[0]!.year, points[0]!.tons);
  const lastPt = project(
    points[points.length - 1]!.year,
    points[points.length - 1]!.tons,
  );
  let areaPath = `M ${firstPt.x} ${areaBase} L ${firstPt.x} ${firstPt.y}`;
  for (let i = 1; i < points.length; i++) {
    const { x, y } = project(points[i]!.year, points[i]!.tons);
    areaPath += ` L ${x} ${y}`;
  }
  areaPath += ` L ${lastPt.x} ${areaBase} Z`;

  const markerYear =
    calendarYear >= minYear && calendarYear <= maxYear ? calendarYear : null;
  const markerTons = markerYear
    ? projectedAnnualEmissionsTonsForYear(
        baseline,
        glideStart,
        targetYear,
        markerYear,
      )
    : null;
  const markerPos =
    markerYear !== null && markerTons !== null
      ? project(markerYear, markerTons)
      : null;

  const monoStyle = {
    fill: "#9dd8ff",
    fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace",
    fontSize: "2.85",
    opacity: 0.78,
  } as const;

  /** Keeps numeric labels readable over the neon stroke (SVG paints in document order). */
  const labelHalo = {
    paintOrder: "stroke fill" as const,
    stroke: "#05051a",
    strokeWidth: 0.55,
    strokeLinejoin: "round" as const,
  };

  return (
    <section
      aria-label="Projected annual emissions trajectory"
      className="mt-8 w-full rounded-[10px] border border-white/12 bg-[linear-gradient(165deg,rgba(35,82,220,0.22)_0%,rgba(20,39,95,0.42)_52%,rgba(1,1,45,0.55)_100%)] p-4 shadow-brand sm:mt-9 sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brand-muted sm:text-xs">
            Trajectory (stretch)
          </p>
          <h2 className="mt-1.5 font-heading text-lg font-semibold text-white sm:mt-2 sm:text-xl">
            Projected emissions vs. net-zero year
          </h2>
        </div>
        <p className="max-w-md text-[0.7rem] leading-relaxed text-white/55 sm:text-xs">
          Linear glide from {glideStart} → {targetYear}. Vertical scale runs{" "}
          <span className="whitespace-nowrap">0 →</span>{" "}
          <span className="font-mono text-brand-accent">{num.format(baseline)}</span>{" "}
          <span className="whitespace-nowrap">tCO₂e/yr</span> (inventoried baseline at glide
          start).
        </p>
      </div>

      <div className="mt-4 w-full min-w-0 sm:mt-5">
        <svg
          className="mx-auto block h-[clamp(13rem,32vw,26rem)] w-full max-w-none sm:h-[clamp(15rem,28vw,32rem)]"
          viewBox={`0 0 ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <title>
            Emissions from {minYear} to {maxYear}; vertical axis 0 through{" "}
            {num.format(baseline)} tCO₂e per year (see description text).
          </title>
          <defs>
            <clipPath id={plotClipId}>
              <rect
                height={vbH}
                width={vbW - chartLeft}
                x={chartLeft}
                y={0}
              />
            </clipPath>
            <linearGradient id="emissionsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#62f58a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2352dc" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#${plotClipId})`}>
            <path d={areaPath} fill="url(#emissionsFill)" stroke="none" />
            <polyline
              fill="none"
              stroke="#62f58a"
              strokeLinecap="butt"
              strokeLinejoin="round"
              strokeWidth={0.9}
              points={line}
            />
            {markerPos !== null ? (
              <g aria-hidden>
                <line
                  x1={markerPos.x}
                  x2={markerPos.x}
                  y1={padT}
                  y2={areaBase}
                  stroke="#62f58a"
                  strokeDasharray="1.45 1.25"
                  strokeOpacity={0.55}
                  strokeWidth={0.35}
                />
                <circle
                  cx={markerPos.x}
                  cy={markerPos.y}
                  fill="#050520"
                  r={1.5}
                  stroke="#62f58a"
                  strokeWidth={0.5}
                />
                <text
                  x={Math.min(markerPos.x + 1.5, vbW - padR - 18)}
                  y={Math.max(markerPos.y - 2.75, padT + 8)}
                  fill="#bdfdd0"
                  fontFamily="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace"
                  fontSize="3.1"
                  opacity={0.92}
                >
                  {calendarYear}
                </text>
              </g>
            ) : null}
          </g>
          <text
            dominantBaseline="hanging"
            textAnchor="start"
            x={1.15}
            y={2.35}
            {...labelHalo}
            {...monoStyle}
            fontSize="2.65"
          >
            {formatCompactTonsPerYear(baseline)}
          </text>
          <line
            x1={chartLeft}
            x2={vbW - padR}
            y1={areaBase}
            y2={areaBase}
            stroke="#2352dc"
            strokeOpacity={0.55}
            strokeWidth={0.35}
          />
          <text x={chartLeft} y={vbH - 2.75} textAnchor="start" {...monoStyle}>
            {minYear}
          </text>
          <text x={vbW - padR} y={vbH - 2.75} textAnchor="end" {...monoStyle}>
            {maxYear}
          </text>
          <text
            x={chartLeft}
            y={areaBase + 4.25}
            {...labelHalo}
            {...monoStyle}
          >
            0
          </text>
        </svg>
      </div>
      <p className="mt-2 font-mono text-[0.6rem] text-white/42 sm:mt-2.5 sm:text-[0.65rem]">
        Axes · years (horizontal) vs. modeled annual emissions (vertical); upper-left caption is
        the glide-start baseline cap (same value as the header blurb).{" "}
        {markerYear !== null
          ? `${calendarYear} marker uses the viewer clock (linear glide heuristic).`
          : "Calendar year sits outside chart window — glide span only."}
      </p>
    </section>
  );
}
