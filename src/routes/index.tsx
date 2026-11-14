import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Battery,
  Bluetooth,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Download,
  HeartPulse,
  Pause,
  Play,
  Radio,
  ShieldCheck,
  Signal,
  Thermometer,
  Watch,
  Waves,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import wearableImage from "@/assets/astravitals-wearable.jpg";
import {
  INITIAL_PACKET,
  makeTelemetryPacket,
  type DemoScenario,
} from "@/lib/wearable-simulator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AstraVitals — Wearable Digital Twin" },
      {
        name: "description",
        content:
          "An interactive concept for an astronaut wearable, with simulated health telemetry, embedded C++ firmware, and prototype hardware specifications.",
      },
      { property: "og:title", content: "AstraVitals — Wearable Digital Twin" },
      {
        property: "og:description",
        content:
          "Explore an astronaut wearable concept, its simulated signals, hardware stack, and firmware sketch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WearableWorkbench,
});

const firmwareExample = `// AstraVitals · DV–01 · firmware concept
// Illustrative only — no physical sensors are connected.

struct Reading {
  uint8_t  v    = 1;
  uint32_t t    = 1763100000;
  uint8_t  hr   = 78;
  uint8_t  spo2 = 96;
  float    skinTemp = 33.4;
  float    activity = 0.12;
  uint16_t co2 = 420;           // optional SCD41
  float    sqi  = 0.82;
  float    batt = 0.74;
};

void loop() {
  Reading reading = readFilteredSensors();
  applySignalQualityGate(reading.sqi);
  bleNotify(serializeJson(reading)); // 1 Hz packet
  delay(1000);
}`;

function WearableWorkbench() {
  const [isRunning, setIsRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [scenario, setScenario] = useState<DemoScenario>("nominal");
  const [withCo2, setWithCo2] = useState(true);
  const [showFirmware, setShowFirmware] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const packet = useMemo(
    () => (tick === 0 && scenario === "nominal"
      ? { ...INITIAL_PACKET, ...(withCo2 ? { co2: INITIAL_PACKET.co2 } : {}) }
      : makeTelemetryPacket(tick, scenario, withCo2)),
    [tick, scenario, withCo2],
  );
  const quality = scenario === "low-signal" ? "LOW" : scenario === "motion" ? "FAIR" : "GOOD";
  const action = scenario === "low-signal"
    ? "Re-seat the band before collecting another reading."
    : scenario === "motion"
      ? "Let movement settle before comparing this reading."
      : "Keep collecting the baseline; no check is escalated.";
  const actionNote = scenario === "nominal"
    ? "Quality-gated · trend context only"
    : "Demo prompt · not a medical recommendation";

  async function copyPacket() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function downloadPacket() {
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "astravitals-telemetry.json";
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1800);
  }

  return (
    <div className="workbench">
      <header className="topbar">
        <a className="brand-lockup" href="#signals" aria-label="AstraVitals home">
          <span className="brand-mark"><Activity size={19} strokeWidth={2.1} /></span>
          <span className="brand-wordmark">Astra<span>Vitals</span></span>
        </a>
        <span className="topbar-divider" />
        <span className="topbar-context">FLIGHT HEALTH SYSTEMS <span>·</span> DIGITAL TWIN</span>
        <div className="topbar-status">
          <span className="live-indicator" aria-hidden="true" />
          <span>SIMULATION MODE</span>
          <span className="status-divider" />
          <span className="prototype-flag"><AlertTriangle size={12} /> NOT A BUILT DEVICE</span>
        </div>
      </header>

      <div className="workspace-layout">
        <aside className="sidebar" aria-label="Project sections">
          <span className="sidebar-label">PROJECT</span>
          <span className="sidebar-project"><span className="project-symbol"><Watch size={15} /></span> DV–01 / FLIGHT BAND</span>
          <span className="sidebar-label sidebar-label-spaced">WORKBENCH</span>
          <a className="sidebar-link sidebar-link-active" href="#signals"><Activity size={16} />Signal room</a>
          <a className="sidebar-link" href="#hardware"><Cpu size={16} />Hardware stack</a>
          <a className="sidebar-link" href="#firmware"><Code2 size={16} />Firmware sketch</a>
          <div className="sidebar-bottom">
            <span className="sidebar-label">DESIGN STATUS</span>
            <span className="sidebar-note"><span className="sidebar-dot" /> Bench concept</span>
            <p>Wearable readings are simulated. Physical build and sensor validation have not been completed.</p>
            <span className="sidebar-build">ASTRAVITALS <span>·</span> DESIGN 001</span>
          </div>
        </aside>

        <main className="main-content">
          <section className="intro-line" aria-label="Concept heading">
            <div className="eyebrow"><span>WEARABLE CONCEPT</span><span className="eyebrow-separator">/</span><span>DIGITAL TWIN</span></div>
            <div className="intro-note"><Bluetooth size={14} /> BLE · 1 HZ PACKET</div>
          </section>

          <section className="signal-section" id="signals">
            <div className="section-header">
              <div>
                <div className="section-index">01 <span>/</span> OBSERVE</div>
                <h1>Flight band <span className="heading-slash">/</span> <span className="muted-heading">DV–01</span></h1>
              </div>
              <span className={`stream-pill ${isRunning ? "stream-on" : "stream-paused"}`}>
                <span className="stream-dot" />{isRunning ? "STREAMING" : "PAUSED"}
              </span>
            </div>

            <div className="control-bar">
              <div className="scenario-controls" role="group" aria-label="Simulation scenario">
                <span className="control-caption">DEMO CONDITION</span>
                {([
                  ["nominal", "Nominal"],
                  ["motion", "Motion"],
                  ["low-signal", "Low signal"],
                ] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={scenario === value ? "default" : "ghost"}
                    aria-pressed={scenario === value}
                    onClick={() => setScenario(value)}
                  >
                    {value === "nominal" && <Check size={13} />}
                    {value === "motion" && <Waves size={13} />}
                    {value === "low-signal" && <Signal size={13} />}
                    {label}
                  </Button>
                ))}
              </div>
              <div className="stream-controls">
                <Button type="button" size="sm" variant={withCo2 ? "secondary" : "ghost"} aria-pressed={withCo2} onClick={() => setWithCo2((value) => !value)}>
                  <span className={`co2-toggle-dot ${withCo2 ? "co2-enabled" : ""}`} /> CO₂ {withCo2 ? "ON" : "OFF"}
                </Button>
                <Button type="button" size="sm" variant="outline" className="run-button" onClick={() => setIsRunning((value) => !value)} aria-label={isRunning ? "Pause simulation" : "Run simulation"}>
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}{isRunning ? "Pause" : "Run twin"}
                </Button>
              </div>
            </div>

            <div className="overview-grid">
              <figure className="device-figure">
                <div className="device-image-wrap">
                  <img className="device-image" src={wearableImage} alt="Concept rendering of an astronaut wearable with a forest-green sensor module, perforated graphite strap, optical sensor, and orange side button" width={1536} height={1024} fetchPriority="high" />
                  <span className="render-badge"><span /> DESIGN RENDER · NOT MANUFACTURED</span>
                  <span className="image-counter">DV–01 <span>/</span> 001</span>
                </div>
                <figcaption className="figure-caption"><span><Watch size={14} /> ASTRAVITALS FLIGHT BAND</span><span>CONCEPT RENDER</span></figcaption>
              </figure>

              <div className="telemetry-column">
                <div className="telemetry-heading">
                  <div>
                    <span className="mini-overline">INCOMING · TELEMETRY</span>
                    <h2>Body signals <span>·</span> <span className="reading-frequency">1 Hz</span></h2>
                  </div>
                  <span className="source-icon"><Radio size={16} /></span>
                </div>

                <div className="metrics-grid" aria-live="polite" aria-label="Simulated sensor readings">
                  <Metric icon={<HeartPulse />} label="HEART RATE" value={String(packet.hr)} unit="bpm" note="Optical PPG" trend="coral" />
                  <Metric icon={<Activity />} label="OXYGEN SAT.¹" value={String(packet.spo2)} unit="%" note="Trend only" trend="green" />
                  <Metric icon={<Thermometer />} label="SKIN TEMP.²" value={packet.skinTemp.toFixed(1)} unit="°C" note="Surface reading" trend="orange" />
                  <Metric icon={<Waves />} label="ACTIVITY" value={packet.activity.toFixed(2)} unit="a.u." note="High-pass accel." trend="green" />
                </div>

                <div className="telemetry-extras">
                  {withCo2 && packet.co2 !== undefined && <div className="extra-reading"><span>PERSONAL CO₂ <span className="optional-label">OPTIONAL</span></span><strong>{packet.co2} <small>ppm</small></strong></div>}
                  <div className="extra-reading extra-reading-quality">
                    <span>QUALITY GATE</span>
                    <strong className={`quality-text quality-${scenario}`}>{(packet.sqi * 100).toFixed(0)}<small>% · {quality}</small></strong>
                  </div>
                </div>
                <div className="signal-quality-bar" role="progressbar" aria-label="Simulated signal quality" aria-valuenow={Math.round(packet.sqi * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <span className={`signal-quality-fill quality-fill-${scenario}`} style={{ width: `${packet.sqi * 100}%` }} />
                </div>

                <div className="next-check">
                  <div className="next-check-icon">{scenario === "low-signal" || scenario === "motion" ? <AlertTriangle size={16} /> : <ShieldCheck size={17} />}</div>
                  <div className="next-check-copy"><span className="mini-overline">NEXT BEST CHECK <span>·</span> {scenario === "nominal" ? "BASELINE" : "SIGNAL REVIEW"}</span><strong>{action}</strong><small>{actionNote}</small></div>
                  <ChevronRight className="next-check-arrow" size={17} />
                </div>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-heading">
                <div><span className="mini-overline">SIGNAL TRACE</span><h2>Heart rate <span>·</span> last 30 samples</h2></div>
                <span className="chart-scale">bpm <span>—</span> illustrative only</span>
              </div>
              <SignalTrace tick={tick} scenario={scenario} />
              <div className="chart-footer"><span>OLDER</span><span className="trace-legend"><span /> HEART RATE · SIMULATED</span><span>NOW <span className="now-dot" /></span></div>
            </div>

            <div className="packet-row">
              <div className="packet-id"><span className="mini-overline">LATEST PACKET</span><code>telemetry.v1 <span>·</span> t {packet.t}</code></div>
              <span className="packet-divider" />
              <div className="packet-transport"><Wifi size={14} /><span>BLE SOURCE <span>·</span> SIMULATED</span></div>
              <div className="packet-actions">
                <Button type="button" variant="ghost" size="sm" onClick={copyPacket} aria-label="Copy current telemetry JSON">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy JSON"}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={downloadPacket} aria-label="Download current telemetry JSON">{downloaded ? <Check size={14} /> : <Download size={14} />}{downloaded ? "Saved" : "Export"}</Button>
              </div>
            </div>

            <p className="measurement-caveat"><span>¹</span> Wrist SpO₂ is a trend only and needs calibration. <span>²</span> Skin temperature is not core temperature. Simulated readings are not medical advice or clinically validated.</p>
          </section>

          <section id="hardware" className="hardware-section">
            <SectionHeading number="02" label="COMPONENTS" title="Prototype hardware" suffix="Bench concept · not assembled" />
            <div className="hardware-grid">
              <HardwareItem icon={<Cpu />} role="MCU · BLE" name="XIAO nRF52840 Sense" detail="Bluetooth Low Energy · built-in IMU" badge="CORE" />
              <HardwareItem icon={<HeartPulse />} role="OPTICAL PPG" name="MAX30102" detail="Heart rate · SpO₂ trend only" badge="WRIST" />
              <HardwareItem icon={<Thermometer />} role="SKIN TEMPERATURE" name="TMP117" detail="Surface temperature · not core" badge="OPTION" />
              <HardwareItem icon={<Battery />} role="POWER" name="150–300 mAh LiPo" detail="Cell and spacecraft safety TBD" badge="REVIEW" />
            </div>
            <div className="hardware-footnote"><span><Waves size={14} /> 6-AXIS MOTION <span>·</span> GYRO MAGNITUDE + HIGH-PASS ACCEL</span><span className="hardware-co2">{withCo2 ? "OPTIONAL CO₂ · SCD41 ENABLED" : "OPTIONAL CO₂ · SCD41 DISABLED"}</span></div>
            <p className="motion-note">Uses movement change rather than a 1 g gravity reference; the SCD41 is an optional personal CO₂ sensor.</p>
          </section>

          <section id="firmware" className="firmware-section">
            <SectionHeading number="03" label="SOFTWARE CONCEPT" title="The band is the source." suffix="The signal engine asks what to check next." />
            <div className="pipeline" aria-label="Wearable data flow">
              <PipelineStep number="01" label="WRIST BAND" description="Filtered sensor samples" icon={<Watch />} />
              <ChevronRight className="pipeline-arrow" size={16} />
              <PipelineStep number="02" label="BLE · 1 HZ" description="Versioned telemetry" icon={<Bluetooth />} />
              <ChevronRight className="pipeline-arrow" size={16} />
              <PipelineStep number="03" label="QUALITY GATE" description="Check the signal first" icon={<ShieldCheck />} />
              <ChevronRight className="pipeline-arrow" size={16} />
              <PipelineStep number="04" label="NEXT CHECK" description="Reasoning, not just charts" icon={<Activity />} />
            </div>

            <div className="code-panel">
              <div className="code-topbar">
                <div className="code-file"><Code2 size={15} /><span>{showFirmware ? "flight_band.ino" : "telemetry.v1.json"}</span><span className="file-modifier">{showFirmware ? "C++ · SKETCH" : "JSON · LIVE PACKET"}</span></div>
                <div className="code-controls">
                  <Button type="button" size="sm" variant={showFirmware ? "ghost" : "secondary"} aria-pressed={!showFirmware} onClick={() => setShowFirmware(false)}>JSON</Button>
                  <Button type="button" size="sm" variant={showFirmware ? "secondary" : "ghost"} aria-pressed={showFirmware} onClick={() => setShowFirmware(true)}>C++ firmware</Button>
                  <span className="code-separator" />
                  <Button type="button" size="icon" variant="ghost" className="copy-code-button" onClick={() => {
                    const code = showFirmware ? firmwareExample : JSON.stringify(packet, null, 2);
                    void navigator.clipboard.writeText(code).then(() => setCopied(true)).catch(() => setCopied(false));
                  }} aria-label="Copy displayed code"><Copy size={15} /></Button>
                </div>
              </div>
              <pre className="firmware-code" aria-label={showFirmware ? "Illustrative C++ firmware sketch" : "Live simulated telemetry JSON"}><code>{showFirmware ? firmwareExample : JSON.stringify(packet, null, 2)}</code></pre>
              <div className="code-footnote"><span><span className="code-status-dot" /> {showFirmware ? "ILLUSTRATIVE SKETCH · NOT READY TO FLASH" : "SCHEMA V1 · SAME SHAPE FOR SIM OR BLE"}</span><span>NO PHYSICAL DEVICE CONNECTED</span></div>
            </div>
          </section>

          <footer className="workbench-footer"><div className="footer-mark"><Activity size={14} /> ASTRA<span>VITALS</span></div><span>RESEARCH CONCEPT <span>·</span> BENCH BUILD NOT STARTED <span>·</span> NOT FOR CLINICAL USE</span><a href="#signals">BACK TO SIGNALS ↑</a></footer>
        </main>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, unit, note, trend }: { icon: React.ReactNode; label: string; value: string; unit: string; note: string; trend: string }) {
  return (
    <article className="metric-tile">
      <div className="metric-top"><span className={`metric-icon metric-icon-${trend}`}>{icon}</span><span className="metric-label">{label}</span></div>
      <div className="metric-value">{value}<span>{unit}</span></div>
      <span className="metric-note">{note}</span>
    </article>
  );
}

function SignalTrace({ tick, scenario }: { tick: number; scenario: DemoScenario }) {
  const points = Array.from({ length: 64 }, (_, index) => {
    const time = index + tick;
    const disturbance = scenario === "motion" ? Math.sin(time * 2.13) * 7 : scenario === "low-signal" ? Math.sin(time * 0.87) * 1.7 : 0;
    const value = Math.sin(time * 0.61) * 5 + Math.sin(time * 1.37) * 2 + disturbance;
    return `${(index / 63) * 700},${22 - value}`;
  }).join(" ");
  return <div className="trace-wrap"><svg className="trace-chart" viewBox="0 0 700 44" preserveAspectRatio="none" aria-label={`Illustrative ${scenario} heart rate signal trace`} role="img"><path className="trace-grid-line" d="M0 10.5H700 M0 22H700 M0 33.5H700" /><polyline className={`trace-line trace-line-${scenario}`} points={points} /></svg></div>;
}

function HardwareItem({ icon, role, name, detail, badge }: { icon: React.ReactNode; role: string; name: string; detail: string; badge: string }) {
  return (
    <article className="hardware-item">
      <div className="hardware-item-top"><span className="hardware-icon">{icon}</span><span className={`hardware-badge ${badge === "REVIEW" ? "hardware-badge-review" : ""}`}>{badge}</span></div>
      <span className="hardware-role">{role}</span><h3>{name}</h3><p>{detail}</p>
    </article>
  );
}

function SectionHeading({ number, label, title, suffix }: { number: string; label: string; title: string; suffix: string }) {
  return <div className="component-heading"><div><span className="section-index">{number} <span>/</span> {label}</span><h2>{title}</h2></div><span className="component-suffix">{suffix}</span></div>;
}

function PipelineStep({ number, label, description, icon }: { number: string; label: string; description: string; icon: React.ReactNode }) {
  return <div className="pipeline-step"><span className="pipeline-number">{number}</span><span className="pipeline-icon">{icon}</span><span className="pipeline-label">{label}</span><span className="pipeline-description">{description}</span></div>;
}