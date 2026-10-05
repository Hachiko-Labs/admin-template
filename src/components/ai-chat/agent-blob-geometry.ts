const CENTER = 32;
const POINT_COUNT = 48;

export const AGENT_BLOB_SILHOUETTES = [
  "orb",
  "pebble",
  "squircle",
  "capsule",
  "triangle",
  "hexagon",
  "cloud",
  "droplet",
] as const;

export type AgentBlobSilhouette = (typeof AGENT_BLOB_SILHOUETTES)[number];

export interface AgentBlobEyeLayout {
  leftX: number;
  rightX: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation: number;
  maxGazeX: number;
  maxGazeY: number;
}

export interface AgentBlobSample {
  bodyPath: string;
  bodyTransform: string;
  eyeLayout: AgentBlobEyeLayout;
}

interface Point {
  x: number;
  y: number;
}

const EYE_LAYOUTS: Record<AgentBlobSilhouette, AgentBlobEyeLayout> = {
  orb: {
    leftX: 27,
    rightX: 37,
    y: 29.3,
    width: 3.8,
    height: 8.2,
    radius: 1.9,
    rotation: -11,
    maxGazeX: 2.3,
    maxGazeY: 1.6,
  },
  pebble: {
    leftX: 27.05,
    rightX: 36.85,
    y: 29.5,
    width: 3.7,
    height: 7.8,
    radius: 1.85,
    rotation: -11,
    maxGazeX: 2.4,
    maxGazeY: 1.35,
  },
  squircle: {
    leftX: 27,
    rightX: 37,
    y: 29.3,
    width: 3.8,
    height: 8,
    radius: 1.9,
    rotation: -11,
    maxGazeX: 2.2,
    maxGazeY: 1.55,
  },
  capsule: {
    leftX: 26.5,
    rightX: 37.5,
    y: 29.6,
    width: 3.8,
    height: 7.6,
    radius: 1.9,
    rotation: -11,
    maxGazeX: 2.7,
    maxGazeY: 1.2,
  },
  triangle: {
    leftX: 27.4,
    rightX: 36.6,
    y: 30.5,
    width: 3.5,
    height: 7.2,
    radius: 1.75,
    rotation: -11,
    maxGazeX: 1.7,
    maxGazeY: 1.1,
  },
  hexagon: {
    leftX: 27,
    rightX: 37,
    y: 29.6,
    width: 3.8,
    height: 8,
    radius: 1.9,
    rotation: -11,
    maxGazeX: 2.15,
    maxGazeY: 1.5,
  },
  cloud: {
    leftX: 27.1,
    rightX: 36.9,
    y: 29.8,
    width: 3.7,
    height: 7.8,
    radius: 1.85,
    rotation: -11,
    maxGazeX: 1.9,
    maxGazeY: 1.3,
  },
  droplet: {
    leftX: 27.4,
    rightX: 36.6,
    y: 30.6,
    width: 3.6,
    height: 7.8,
    radius: 1.8,
    rotation: -11,
    maxGazeX: 1.8,
    maxGazeY: 1.3,
  },
};

function signedPower(value: number, exponent: number) {
  return Math.sign(value) * Math.abs(value) ** exponent;
}

function polygonRadius(angle: number, sides: number, rotation: number) {
  const sector = (Math.PI * 2) / sides;
  const localAngle =
    ((angle - rotation + sector / 2 + Math.PI * 2) % sector) - sector / 2;
  return Math.cos(Math.PI / sides) / Math.cos(localAngle);
}

function capsuleRadius(angle: number) {
  const halfSegment = 10.5;
  const capRadius = 17;
  const absCosine = Math.abs(Math.cos(angle));
  const absSine = Math.abs(Math.sin(angle));

  if (absSine > 0 && (capRadius * absCosine) / absSine <= halfSegment) {
    return capRadius / absSine;
  }

  return (
    halfSegment * absCosine +
    Math.sqrt(Math.max(0, capRadius ** 2 - halfSegment ** 2 * absSine ** 2))
  );
}

function basePoint(silhouette: AgentBlobSilhouette, angle: number): Point {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  switch (silhouette) {
    case "orb":
      return {
        x: CENTER + cosine * 24.7,
        y: CENTER + sine * 24.7,
      };
    case "pebble": {
      const contour =
        1 + Math.sin(angle + 0.35) * 0.035 + Math.cos(angle * 3 - 0.65) * 0.024;

      return {
        x: CENTER + cosine * 25.2 * contour + sine * 1.15,
        y: CENTER + sine * 21.4 * contour,
      };
    }
    case "squircle": {
      const exponent = 2 / 4.2;
      return {
        x: CENTER + signedPower(cosine, exponent) * 23.2,
        y: CENTER + signedPower(sine, exponent) * 23.2,
      };
    }
    case "capsule": {
      const radius = capsuleRadius(angle);
      return {
        x: CENTER + cosine * radius,
        y: CENTER + sine * radius,
      };
    }
    case "triangle": {
      const radius = polygonRadius(angle, 3, -Math.PI / 6) * 28;
      return {
        x: CENTER + cosine * radius,
        y: CENTER + sine * radius,
      };
    }
    case "hexagon": {
      const radius = polygonRadius(angle, 6, -Math.PI / 2) * 27;
      return {
        x: CENTER + cosine * radius,
        y: CENTER + sine * radius,
      };
    }
    case "cloud": {
      const radius =
        24 +
        Math.cos(angle * 5 + 0.35) * 1.9 +
        Math.cos(angle * 3 - 0.8) * 0.85;
      return {
        x: CENTER + cosine * radius,
        y: CENTER + sine * radius,
      };
    }
    case "droplet": {
      const horizontalExponent = 1.02 - sine * 0.34;
      const lowerFullness = 1 + sine * 0.13;

      return {
        x:
          CENTER +
          signedPower(cosine, horizontalExponent) * 22.7 * lowerFullness,
        y: CENTER + sine * 25.4,
      };
    }
  }
}

function createBaseProfile(silhouette: AgentBlobSilhouette) {
  return Object.freeze(
    Array.from({ length: POINT_COUNT }, (_, index) => {
      const angle = (index / POINT_COUNT) * Math.PI * 2;
      return basePoint(silhouette, angle);
    }),
  );
}

const BASE_PROFILES = {
  orb: createBaseProfile("orb"),
  pebble: createBaseProfile("pebble"),
  squircle: createBaseProfile("squircle"),
  capsule: createBaseProfile("capsule"),
  triangle: createBaseProfile("triangle"),
  hexagon: createBaseProfile("hexagon"),
  cloud: createBaseProfile("cloud"),
  droplet: createBaseProfile("droplet"),
} satisfies Record<AgentBlobSilhouette, readonly Point[]>;

function animatedPoint(
  silhouette: AgentBlobSilhouette,
  point: Point,
  angle: number,
  time: number,
): Point {
  const x = point.x - CENTER;
  const y = point.y - CENTER;

  switch (silhouette) {
    case "orb": {
      const breath = 1 + Math.sin(time * 0.82) * 0.007;
      return { x: CENTER + x * breath, y: CENTER + y * breath };
    }
    case "pebble": {
      const drift = 1 + Math.sin(angle * 3 + time * 0.46) * 0.009;
      const settle = 1 + Math.sin(time * 0.58) * 0.004;
      return {
        x: CENTER + x * drift,
        y: CENTER + y * drift * settle,
      };
    }
    case "squircle": {
      const flex = Math.sin(time * 0.68) * 0.008;
      return {
        x: CENTER + x * (1 + flex),
        y: CENTER + y * (1 - flex),
      };
    }
    case "capsule": {
      const stretch = Math.sin(time * 0.5) * 0.012;
      return {
        x: CENTER + x * (1 + stretch),
        y: CENTER + y * (1 - stretch * 0.25),
      };
    }
    case "triangle":
      return point;
    case "hexagon": {
      const pulse = 1 + Math.sin(time * 0.44) * 0.004;
      return {
        x: CENTER + x * pulse,
        y: CENTER + y * pulse,
      };
    }
    case "cloud": {
      const lobeBreath = 1 + Math.cos(angle * 5 + time * 0.28) * 0.009;
      return {
        x: CENTER + x * lobeBreath,
        y: CENTER + y * lobeBreath,
      };
    }
    case "droplet": {
      const sway = Math.sin(time * 0.55) * 0.38;
      const float = Math.sin(time * 0.72 + 0.8) * 0.12;
      return {
        x: CENTER + x + sway * (-y / 25.4),
        y: CENTER + y + float,
      };
    }
  }
}

function closedCurvePath(points: readonly Point[]) {
  const first = points[0];
  if (!first) return "";

  let path = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;

  for (let index = 0; index < points.length; index += 1) {
    const previous = points[(index - 1 + points.length) % points.length];
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const afterNext = points[(index + 2) % points.length];
    if (!previous || !current || !next || !afterNext) continue;

    const control1X = current.x + (next.x - previous.x) / 6;
    const control1Y = current.y + (next.y - previous.y) / 6;
    const control2X = next.x - (afterNext.x - current.x) / 6;
    const control2Y = next.y - (afterNext.y - current.y) / 6;

    path += ` C ${control1X.toFixed(2)} ${control1Y.toFixed(2)} ${control2X.toFixed(2)} ${control2Y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  return `${path} Z`;
}

export function sampleAgentBlob(
  silhouette: AgentBlobSilhouette,
  seconds: number,
  phase = 0,
): AgentBlobSample {
  const time = seconds + phase;
  const points = BASE_PROFILES[silhouette].map((point, index) => {
    const angle = (index / POINT_COUNT) * Math.PI * 2;
    return animatedPoint(silhouette, point, angle, time);
  });

  const rotation = silhouette === "triangle" ? Math.sin(time * 0.38) * 0.9 : 0;

  return {
    bodyPath: closedCurvePath(points),
    bodyTransform: `translate(0 0) rotate(${rotation.toFixed(2)} 32 32)`,
    eyeLayout: EYE_LAYOUTS[silhouette],
  };
}
