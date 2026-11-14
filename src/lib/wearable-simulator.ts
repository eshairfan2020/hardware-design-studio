export type DemoScenario = "nominal" | "motion" | "low-signal";

export type TelemetryPacket = {
  v: 1;
  t: number;
  hr: number;
  spo2: number;
  skinTemp: number;
  activity: number;
  co2?: number;
  sqi: number;
  batt: number;
};

export const INITIAL_PACKET: TelemetryPacket = {
  v: 1,
  t: 1763100000,
  hr: 78,
  spo2: 96,
  skinTemp: 33.4,
  activity: 0.12,
  co2: 420,
  sqi: 0.82,
  batt: 0.74,
};

export function makeTelemetryPacket(
  tick: number,
  scenario: DemoScenario,
  withCo2: boolean,
): TelemetryPacket {
  const cycle = Math.max(tick, 1);
  const moving = scenario === "motion";
  const lowSignal = scenario === "low-signal";
  const packet: TelemetryPacket = {
    v: 1,
    t: INITIAL_PACKET.t + tick,
    hr: Math.round(78 + Math.sin(cycle * 0.35) * 3 + (moving ? 8 : 0)),
    spo2: Math.max(92, 96 - (lowSignal ? 2 : 0) - (moving ? 1 : 0)),
    skinTemp: Number((33.4 + Math.sin(cycle * 0.12) * 0.3).toFixed(1)),
    activity: Number((moving ? 0.72 + Math.abs(Math.sin(cycle)) * 0.18 : 0.12 + Math.abs(Math.sin(cycle)) * 0.05).toFixed(2)),
    sqi: lowSignal ? 0.34 : moving ? 0.55 : 0.82,
    batt: Number(Math.max(0, 0.74 - tick * 0.0001).toFixed(3)),
  };

  if (withCo2) {
    packet.co2 = 420 + Math.round(Math.sin(cycle * 0.15) * 8);
  }

  return packet;
}