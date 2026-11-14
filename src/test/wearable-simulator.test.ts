import { describe, expect, it } from "vitest";

import { INITIAL_PACKET, makeTelemetryPacket } from "@/lib/wearable-simulator";

describe("wearable telemetry digital twin", () => {
  it("matches the uploaded version 1 example telemetry packet", () => {
    expect(INITIAL_PACKET).toEqual({
      v: 1,
      t: 1763100000,
      hr: 78,
      spo2: 96,
      skinTemp: 33.4,
      activity: 0.12,
      co2: 420,
      sqi: 0.82,
      batt: 0.74,
    });
  });

  it("omits optional CO₂ when the prototype sensor is disabled", () => {
    expect(makeTelemetryPacket(1, "nominal", false)).not.toHaveProperty("co2");
  });

  it("lowers signal quality for the low-signal demo condition", () => {
    expect(makeTelemetryPacket(1, "low-signal", true).sqi).toBe(0.34);
  });

  it("increases activity for the motion demo condition", () => {
    expect(makeTelemetryPacket(1, "motion", true).activity).toBeGreaterThan(0.72);
  });
});