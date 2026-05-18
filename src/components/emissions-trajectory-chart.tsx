import {
  glidePathStartYearFromActions,
  projectedAnnualEmissionsTonsForYear,
} from "@/lib/calculations";
import type { CityProfile } from "@/lib/schemas";

const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

type Props = {
  profile: CityProfile;
};

/**
 * Lightweight SVG trajectory (stretch): linear glide of inventoried baseline → 0 by net-zero year.
 * Palette: brand blue field + neon spring-green stroke per DESIGN_SYSTEM.
 */
export function EmissionsTrajectoryChart({ profile }: Props) {
  const glideStart = glidePathStartYearFromActions(
    profile.actions,
    profile.targetYear,
  );
  const baseline = profile.baselineEmissions;
  const targetYear = profile.targetYear;

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
  const vbH = 58;
  const padL = 10;
  const padR = 4;
  const padT = 8;
  const padB = 12;
  const innerW = vbW - padL - padR;
  const innerH = vbH - padT - padB;

  const project = (year: number, tons: number) => {
    const x = padL + ((year - minYear) / spanYears) * innerW;
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
  const lastPt = project(points[points.length - 1]!.year, points[points.length - 1]!.tons);
  let areaPath = `M ${firstPt.x} ${areaBase} L ${firstPt.x} ${firstPt.y}`;
  for (let i = 1; i < points.length; i++) {
    const { x, y } = project(points[i]!.year, points[i]!.tons);
    areaPath += ` L ${x} ${y}`;
  }
  areaPath += ` L ${lastPt.x} ${areaBase} Z`;

  return (
    <section
      aria-label="Projected annual emissions trajectory"
      className="mt-10 rounded-[10px] border border-white/12 bg-[linear-gradient(165deg,rgba(35,82,220,0.22)_0%,rgba(20,39,95,0.42)_52%,rgba(1,1,45,0.55)_100%)] p-6 shadow-brand sm:p-7"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">
            Trajectory (stretch)
          </p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-white sm:text-2xl">
            Projected emissions vs. net-zero year
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-white/55 sm:text-sm">
          Linear glide from {glideStart} → {targetYear}; inventoried baseline{" "}
          <span className="font-mono text-brand-accent">{num.format(baseline)}</span> tCO₂e/yr to 0.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          className="w-full min-w-[280px]"
          viewBox={`0 0 ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <title>
            Emissions from {minYear} to {targetYear}
          </title>
          <defs>
            <linearGradient id="emissionsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#62f58a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2352dc" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#emissionsFill)" stroke="none" />
          <polyline
            fill="none"
            stroke="#62f58a"
            strokeWidth={0.9}
            points={line}
          />
          <line
            x1={padL}
            x2={vbW - padR}
            y1={areaBase}
            y2={areaBase}
            stroke="#2352dc"
            strokeOpacity={0.55}
            strokeWidth={0.35}
          />
        </svg>
      </div>
    </section>
  );
}
