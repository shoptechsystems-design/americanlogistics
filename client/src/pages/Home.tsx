import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Box,
  ChevronDown,
  ClipboardList,
  Receipt,
  Sprout,
  Building2,
  MapPinned,
  PhoneCall,
  CircleCheck,
  Clock3,
  FileCheck2,
  Handshake,
  Mail,
  Menu,
  Phone,
  Quote,
  RadioTower,
  Route as RouteIcon,
  ShieldCheck,
  Snowflake,
  Star,
  Truck,
  X,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";

const NetworkGlobe = lazy(() => import("@/components/NetworkGlobe"));

const PHONE = "+1 (817) 678-4346";
const PHONE_DIGITS = "+18176784346";
const EMAIL = "Dispatch5services@gmail.com";
const SITE_URL = "https://americanlogistics.online";

const stats = [
  { value: <>24<span>/</span>7</>, label: "Live dispatch desk" },
  { value: <CountUp to={5} suffix="+" />, label: "Equipment types dispatched" },
  { value: <CountUp to={48} />, label: "Lower-48 states covered" },
  { value: <>1<span>:</span>1</>, label: "A real dispatcher on your account" },
];

const scope = [
  { icon: MapPinned, title: "Load sourcing", copy: "We search boards and broker relationships for freight that matches your equipment, lanes and home time." },
  { icon: Handshake, title: "Rate negotiation", copy: "We negotiate every rate so your truck is paid what the lane is worth, not the first number offered." },
  { icon: PhoneCall, title: "Broker communication", copy: "Calls, emails and follow-ups with brokers and shippers are on us, so you can focus on driving." },
  { icon: ClipboardList, title: "Rate confirmations", copy: "We review terms, confirm details and make sure what was promised is what is on paper." },
  { icon: RadioTower, title: "Check calls & updates", copy: "We keep brokers informed and flag delays early, so nobody has to chase you for a status." },
  { icon: Receipt, title: "Invoicing support", copy: "We help get paperwork and proof of delivery organised so billing is quick and clean." },
  { icon: RouteIcon, title: "Route & trip planning", copy: "We plan the next load before the current one ends to cut deadhead and idle time." },
  { icon: ShieldCheck, title: "Problem solving", copy: "Detention, breakdowns, reschedules — you have someone to call when plans change." },
];

const audiences = [
  { icon: Truck, title: "Owner-operators", copy: "One truck, your rules. We handle the office work so you can stay on the road and earn." },
  { icon: Building2, title: "Small fleets", copy: "Growing past one truck? We help you keep every unit moving without hiring a full dispatch team." },
  { icon: Sprout, title: "New authorities", copy: "Just got your MC? We help you get started with the right brokers and lanes from day one." },
];

const services = [
  { icon: Box, title: "Box Trucks", copy: "Flexible regional and last-mile freight matched to your equipment." },
  { icon: Truck, title: "Dry Vans", copy: "Consistent lanes, better communication, and rate support from pickup to delivery." },
  { icon: Snowflake, title: "Reefers", copy: "Temperature-sensitive loads coordinated with the urgency they demand." },
  { icon: RouteIcon, title: "Flatbeds & Hotshots", copy: "Specialized freight sourced around your preferred territory and setup." },
];

const benefits = [
  { icon: RadioTower, title: "Always-on communication", copy: "A real person stays close to your load, your broker, and your next move." },
  { icon: Handshake, title: "Rate negotiation", copy: "We protect your time and push for freight that makes sense for your truck." },
  { icon: FileCheck2, title: "Paperwork handled", copy: "From rate confirmations to check calls, we keep the details moving." },
  { icon: ShieldCheck, title: "Carrier-first support", copy: "Clear updates, honest options, and no disappearing when the plan changes." },
];

const steps = [
  { number: "01", title: "Tell us about your truck", copy: "Share your equipment, preferred lanes, and how you want to run." },
  { number: "02", title: "We find the right freight", copy: "Our dispatch team filters opportunities against your real-world goals." },
  { number: "03", title: "We negotiate and coordinate", copy: "We handle broker calls, rate conversations, and the moving parts." },
  { number: "04", title: "You haul. We stay close.", copy: "You focus on the road while we keep the next load and every detail in view." },
];

const testimonials = [
  { quote: "American Logistics gives me the kind of communication I wish I had from every broker. I know what is happening before I have to ask.", name: "Marcus T.", meta: "Dry van carrier · Texas" },
  { quote: "They learned how I like to run instead of sending random loads. My week feels more intentional and a lot less stressful.", name: "Jasmine R.", meta: "Box truck owner · Georgia" },
  { quote: "The biggest difference is that someone actually picks up. When a load shifts, I am not left figuring it out alone.", name: "Derrick W.", meta: "Hotshot operator · Oklahoma" },
];

const faqs = [
  { question: "What equipment do you dispatch?", answer: "We work with box trucks, dry vans, reefers, flatbeds, hotshots, and other owner-operator setups. Tell us what you run and where you want to operate." },
  { question: "How much does dispatching cost?", answer: "We explain our pricing clearly on the first call, before you commit to anything. Ask us about it and we will walk you through exactly how it works." },
  { question: "Do I have to run full-time?", answer: "No. We build around your availability, preferred home time, and the lanes that fit your business." },
  { question: "Can you work with a brand-new MC authority?", answer: "Yes. New carriers are welcome. We will talk through your setup and help you plan a realistic start with the right freight and brokers." },
  { question: "What do I need to get started?", answer: "Typically your MC and DOT numbers, certificate of insurance, W-9, and basic details about your truck and preferred lanes. We will tell you exactly what is needed on the call." },
  { question: "How does the first conversation work?", answer: "We start with a quick, low-pressure call to understand your equipment and goals. From there, we can outline what a dispatch partnership could look like." },
  { question: "Which areas do you cover?", answer: "We dispatch across the lower 48 states. Tell us your home base and preferred lanes and we will build around them." },
];

const equipmentProfiles = [
  { key: "box-truck", label: "Box truck", number: "01", icon: Box, bestFor: "Regional & last-mile", lanes: "Dallas · Atlanta · Houston", dispatch: "Palletized freight, local delivery, and shorter turns with room for home time.", route: { pickup: "DALLAS", destination: "HOUSTON", d: "M 62 216 C 105 205 128 159 174 167 S 224 214 260 178 S 319 91 398 76", stops: [{ x: 62, y: 216, city: "Dallas", freight: "Retail replenishment", detail: "Palletized regional freight with flexible pickup windows and shorter turns." }, { x: 174, y: 167, city: "Waco", freight: "Distribution pallets", detail: "Mid-lane transfer freight suited to box-truck capacity and local delivery." }, { x: 260, y: 178, city: "Austin", freight: "Last-mile inventory", detail: "Time-sensitive store and jobsite deliveries with room for same-day service." }, { x: 398, y: 76, city: "Houston", freight: "Final-mile delivery", detail: "Metro-area freight staged for efficient drop-offs and a quick return lane." }] } },
  { key: "dry-van", label: "Dry van", number: "02", icon: Truck, bestFor: "Consistent over-the-road", lanes: "I-20 · I-40 · I-10", dispatch: "Steady lanes, broker communication, and rate support from pickup through delivery.", route: { pickup: "DALLAS", destination: "ATLANTA", d: "M 58 220 C 122 195 132 110 198 128 S 260 217 302 150 S 344 77 404 63", stops: [{ x: 58, y: 220, city: "Dallas", freight: "Consumer goods", detail: "Full truckload dry freight with dependable I-20 pickup windows." }, { x: 198, y: 128, city: "Shreveport", freight: "Building materials", detail: "Brokered replenishment freight moving east with clear appointment timing." }, { x: 302, y: 150, city: "Birmingham", freight: "General merchandise", detail: "Balanced over-the-road freight with room to protect driver hours." }, { x: 404, y: 63, city: "Atlanta", freight: "Retail distribution", detail: "High-volume inbound freight coordinated through delivery and check calls." }] } },
  { key: "reefer", label: "Reefer", number: "03", icon: Snowflake, bestFor: "Temperature-sensitive", lanes: "Southwest · Southeast", dispatch: "Time-critical freight coordinated around appointment windows and check calls.", route: { pickup: "PHOENIX", destination: "ATLANTA", d: "M 54 226 C 105 203 148 214 177 177 S 211 84 267 112 S 331 192 404 58", stops: [{ x: 54, y: 226, city: "Phoenix", freight: "Fresh produce", detail: "Temperature-controlled produce loads with pre-cooled equipment checks." }, { x: 177, y: 177, city: "Albuquerque", freight: "Frozen foods", detail: "Cold-chain freight managed around strict appointment and temperature windows." }, { x: 267, y: 112, city: "Memphis", freight: "Grocery distribution", detail: "Time-critical reefer freight with proactive check calls at each handoff." }, { x: 404, y: 58, city: "Atlanta", freight: "Fresh & frozen delivery", detail: "Final appointment coordinated with receiver requirements and live updates." }] } },
  { key: "flatbed", label: "Flatbed / hotshot", number: "04", icon: RouteIcon, bestFor: "Specialized & urgent", lanes: "Texas · Oklahoma · Midwest", dispatch: "Equipment-aware sourcing for open-deck, project, and expedited freight.", route: { pickup: "OKLAHOMA CITY", destination: "CHICAGO", d: "M 57 222 C 111 178 154 181 182 132 S 232 67 279 102 S 336 151 404 54", stops: [{ x: 57, y: 222, city: "Oklahoma City", freight: "Steel & pipe", detail: "Open-deck project freight matched to securement needs and equipment setup." }, { x: 182, y: 132, city: "Tulsa", freight: "Industrial components", detail: "Regional project moves with flexible loading windows and broker coordination." }, { x: 279, y: 102, city: "St. Louis", freight: "Farm equipment", detail: "Oversize-capable freight planned around permits, routing, and appointment timing." }, { x: 404, y: 54, city: "Chicago", freight: "Construction materials", detail: "Midwest delivery coordinated for jobsite access and fast proof of delivery." }] } },
] as const;

function BrandMark() {
  return (
    <a className="brand" href="#top" aria-label="American Logistics home">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-route" />
        <span className="brand-dot brand-dot-one" />
        <span className="brand-dot brand-dot-two" />
      </span>
      <span className="brand-copy">
        <strong>AMERICAN <span>LOGISTICS</span></strong>
        <small>FREIGHT DISPATCH</small>
      </span>
    </a>
  );
}

function LazyGlobe() {
  const holderRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!holderRef.current || !("IntersectionObserver" in window)) { setNear(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: "500px 0px" });
    observer.observe(holderRef.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={holderRef} className="globe-holder">{near && <Suspense fallback={<div className="globe-loading" />}><NetworkGlobe /></Suspense>}</div>;
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setValue(0);
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1400, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);

  return <span ref={ref}>{value}{suffix}</span>;
}

function ScrollReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const revealRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!revealRef.current || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    observer.observe(revealRef.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={revealRef} className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className}`} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

function FreightFit() {
  const [activeKey, setActiveKey] = useState<(typeof equipmentProfiles)[number]["key"]>("box-truck");
  const [selectedStop, setSelectedStop] = useState<number | null>(null);
  const active = equipmentProfiles.find((profile) => profile.key === activeKey) ?? equipmentProfiles[0];
  const ActiveIcon = active.icon;

  useEffect(() => {
    setSelectedStop(null);
  }, [activeKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedStop(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedStopData = selectedStop === null ? null : active.route.stops[selectedStop];
  const selectedStopPlacement = selectedStopData ? (selectedStopData.x < 105 ? "left" : selectedStopData.x > 355 ? "right" : selectedStopData.y < 90 ? "bottom" : "top") : "top";

  return <section className="freight-fit-section" id="freight-fit">
    <div className="container">
      <ScrollReveal className="freight-fit-heading">
        <div><div className="eyebrow"><span className="eyebrow-line" /> FIND YOUR FREIGHT FIT</div><h2>The right truck.<br /><em>The right kind of run.</em></h2></div>
        <p>Tell us what you operate and where you want to go. We shape the dispatch conversation around your actual equipment—not a generic load list.</p>
      </ScrollReveal>
      <div className={`freight-fit-panel freight-profile-${active.key}`}>
        <div className="freight-fit-tabs" role="tablist" aria-label="Equipment profiles">
          {equipmentProfiles.map((profile) => { const Icon = profile.icon; return <button key={profile.key} className={activeKey === profile.key ? "is-active" : ""} role="tab" aria-selected={activeKey === profile.key} onClick={() => setActiveKey(profile.key)}><span className="freight-tab-number">{profile.number}</span><Icon size={17} /><span>{profile.label}</span><ArrowUpRight size={14} /></button>; })}
        </div>
        <div className="freight-fit-detail" role="tabpanel">
          <div className="freight-route-art"><div className="freight-route-grid" /><div className="freight-route-scan" /><div className="freight-route-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><svg key={active.key} className="freight-route-map" viewBox="0 0 460 300" preserveAspectRatio="none" aria-hidden="true"><path className="freight-route-map-shadow" d={active.route.d} /><path className="freight-route-map-base" d={active.route.d} /><path className="freight-route-map-flow" d={active.route.d} /><g className="freight-route-runner"><circle className="freight-route-runner-trail" r="8"><animateMotion dur="5.2s" repeatCount="indefinite" path={active.route.d} begin="-1.6s" /></circle><circle className="freight-route-runner-core" r="4"><animateMotion dur="5.2s" repeatCount="indefinite" path={active.route.d} rotate="auto" /></circle></g>{active.route.stops.map((stop, index) => <circle key={`${active.key}-${index}`} className={`freight-route-waypoint waypoint-${index}`} cx={stop.x} cy={stop.y} r={index === 0 || index === active.route.stops.length - 1 ? 4 : 3} />)}</svg>{active.route.stops.map((stop, index) => <button key={`${active.key}-stop-${stop.city}`} className={`freight-route-stop ${selectedStop === index ? "is-selected" : ""}`} style={{ "--stop-x": `${stop.x / 4.6}%`, "--stop-y": `${stop.y / 3}%` } as CSSProperties} aria-label={`Show ${stop.city} lane stop details`} aria-pressed={selectedStop === index} onClick={() => setSelectedStop(selectedStop === index ? null : index)}><span /></button>)}{selectedStopData && <div className={`freight-route-stop-card placement-${selectedStopPlacement}`} role="dialog" aria-label={`${selectedStopData.city} freight details`} style={{ "--stop-x": `${selectedStopData.x / 4.6}%`, "--stop-y": `${selectedStopData.y / 3}%` } as CSSProperties}><div><small>LANE STOP</small><strong>{selectedStopData.city}</strong></div><button type="button" aria-label="Close lane stop details" onClick={() => setSelectedStop(null)}><X size={13} /></button><p><b>{selectedStopData.freight}</b>{selectedStopData.detail}</p></div>}<div className="freight-route-route-label route-label-one">PICKUP <b>{active.route.pickup}</b></div><div className="freight-route-route-label route-label-two">DESTINATION <b>{active.route.destination}</b></div><div className="freight-route-node freight-route-node-start"><b>ORIGIN</b><span>READY</span></div><div className="freight-route-node freight-route-node-end"><b>NEXT LOAD</b><span>IN VIEW</span></div><div className="freight-route-truck"><span className="freight-truck-shadow" /><ActiveIcon size={27} strokeWidth={1.2} /><i className="freight-truck-beacon" /></div><div className="freight-route-telemetry"><span><b>LIVE ROUTE</b><strong>98.6%</strong></span><span><b>ETA</b><strong>04:18</strong></span><span><b>STATUS</b><strong>READY</strong></span></div><div className="freight-route-cargo"><span className="cargo-bar cargo-bar-one" /><span className="cargo-bar cargo-bar-two" /><span className="cargo-bar cargo-bar-three" /><b>{active.label.toUpperCase()}</b></div></div>
          <div className="freight-fit-copy"><div className="freight-fit-kicker"><span className="live-dot" /> CURRENT PROFILE <b>{active.number} / 04</b></div><div className="freight-fit-title"><ActiveIcon size={23} /><h3>{active.label}</h3></div><p>{active.dispatch}</p><div className="freight-fit-facts"><div><small>BEST FOR</small><strong>{active.bestFor}</strong></div><div><small>LANE EXAMPLES</small><strong>{active.lanes}</strong></div></div><a className="button button-amber" href="#contact">Build my {active.label.toLowerCase()} plan <ArrowUpRight size={16} /></a></div>
        </div>
      </div>
      <div className="freight-fit-service-area"><span>SERVICE AREA</span><strong>U.S. carrier support</strong><i /><span>LOCAL · REGIONAL · OTR</span><b>Dallas</b><b>Atlanta</b><b>Houston</b><b>Oklahoma City</b><b>Beyond</b></div>
    </div>
  </section>;
}

function LoadToLaunch() {
  const [journeyStep, setJourneyStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionObserver = new IntersectionObserver(([entry]) => setIsActive(entry.isIntersecting), { rootMargin: "300px 0px 300px 0px" });
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) setJourneyStep(Number(visible.target.dataset.step ?? 0));
    }, { threshold: [0.25, 0.55], rootMargin: "-35% 0px -42% 0px" });

    sectionObserver.observe(section);
    stepRefs.current.filter(Boolean).forEach((step) => observer.observe(step as HTMLDivElement));
    return () => { sectionObserver.disconnect(); observer.disconnect(); };
  }, []);

  return <section className={`journey-section ${isActive ? "is-active" : ""}`} id="journey" ref={sectionRef}>
    <div className="container journey-layout">
      <div className={`journey-visual journey-step-${journeyStep}`} aria-label="Scroll-driven dispatch journey illustration">
        <div className="journey-label"><span className="live-dot" /> LIVE LOAD JOURNEY <b>03 / 03</b></div>
        <div className="journey-horizon" />
        <div className="journey-city-lights" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="journey-road"><i /><i /><i /><i /><i /></div>
        <div className="journey-route-line" />
        <div className="journey-road-sign journey-road-sign-one" aria-hidden="true"><b>ATLANTA</b><span>I-20 E</span></div>
        <div className="journey-road-sign journey-road-sign-two" aria-hidden="true"><b>EXIT 18</b><span>REST AREA</span></div>
        <div className="journey-distant-truck" aria-hidden="true"><span /><b>AL</b><i /><i /></div>
        <div className="journey-background-truck" aria-hidden="true"><span className="background-truck-cab" /><span className="background-truck-trailer"><b>AL</b></span><i className="background-wheel-one" /><i className="background-wheel-two" /><em className="background-taillight-one" /><em className="background-taillight-two" /></div>
        <div className="journey-truck"><div className="journey-cab"><span /><i className="journey-headlight journey-headlight-one" /><i className="journey-headlight journey-headlight-two" /></div><div className="journey-trailer"><b>AL</b><div className="cargo cargo-one" /><div className="cargo cargo-two" /><div className="cargo cargo-three" /></div><i className="journey-wheel journey-wheel-one" /><i className="journey-wheel journey-wheel-two" /><i className="journey-wheel journey-wheel-three" /><em className="journey-taillight journey-taillight-one" /><em className="journey-taillight journey-taillight-two" /></div>
        <div className="journey-status"><small>{journeyStep === 0 ? "LOAD ACCEPTED" : journeyStep === 1 ? "CARGO SECURED" : "IN TRANSIT"}</small><strong>{journeyStep === 0 ? "Finding the right fit" : journeyStep === 1 ? "Ready to roll" : "Moving toward Atlanta"}</strong></div>
        <div className="journey-node journey-node-start">DALLAS</div><div className="journey-node journey-node-end">ATLANTA</div>
      </div>
      <div className="journey-copy">
        <ScrollReveal><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> FROM LOAD TO LAUNCH</div><h2>Watch the next move<br /><em>come together.</em></h2><p>Scroll through a typical dispatch moment. We find the opportunity, get the details locked, and keep your truck moving.</p></ScrollReveal>
        <div className="journey-steps">
          {[
            ["01", "Load accepted", "We match the right freight to your equipment, lane, and schedule."],
            ["02", "Cargo secured", "Rates, broker communication, and paperwork get handled before wheels roll."],
            ["03", "Rolling out", "You have the plan, the updates, and a dispatch desk still watching the road."],
          ].map(([number, title, copy], index) => <div className={`journey-step ${journeyStep === index ? "journey-step-active" : ""}`} data-step={index} ref={(element) => { stepRefs.current[index] = element; }} key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={16} /></div>)}
        </div>
      </div>
    </div>
  </section>;
}

function NightRun() {
  const sceneRef = useRef<HTMLElement>(null);
  const [runProgress, setRunProgress] = useState(0);
  const [isDay, setIsDay] = useState(false);
  const [weather, setWeather] = useState<"clear" | "rain" | "fog">("clear");
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const activeRef = useRef(false);
  const audioRef = useRef<{ context: AudioContext; master: GainNode; ambience?: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode }; driving?: { engine: OscillatorNode; engineGain: GainNode; tireSource: AudioBufferSourceNode; tireGain: GainNode }; thunderTimer?: number } | null>(null);

  const stopWeatherAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.thunderTimer) window.clearTimeout(audio.thunderTimer);
    audio.ambience?.source.stop();
    audio.ambience = undefined;
    audio.thunderTimer = undefined;
  };

  const stopDrivingAudio = () => {
    const audio = audioRef.current;
    if (!audio?.driving) return;
    audio.driving.engine.stop();
    audio.driving.tireSource.stop();
    audio.driving = undefined;
  };

  const updateDrivingAudio = (progress: number) => {
    const audio = audioRef.current;
    if (!audio?.driving || audio.context.state !== "running") return;
    const now = audio.context.currentTime;
    const speed = Math.max(0, Math.min(1, progress));
    audio.driving.engine.frequency.setTargetAtTime(48 + speed * 22, now, 0.12);
    audio.driving.engineGain.gain.setTargetAtTime(0.025 + speed * 0.04, now, 0.16);
    audio.driving.tireGain.gain.setTargetAtTime(0.004 + speed * 0.028, now, 0.18);
  };

  const startDrivingAudio = () => {
    const audio = audioRef.current;
    if (!audio || audio.driving) return;
    const { context, master } = audio;
    const now = context.currentTime;
    const engine = context.createOscillator();
    const engineFilter = context.createBiquadFilter();
    const engineGain = context.createGain();
    engine.type = "sawtooth";
    engine.frequency.value = 48;
    engineFilter.type = "lowpass";
    engineFilter.frequency.value = 180;
    engineFilter.Q.value = 0.7;
    engineGain.gain.value = 0.025;
    engine.connect(engineFilter).connect(engineGain).connect(master);

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
    const tireSource = context.createBufferSource();
    const tireFilter = context.createBiquadFilter();
    const tireGain = context.createGain();
    tireSource.buffer = buffer;
    tireSource.loop = true;
    tireFilter.type = "bandpass";
    tireFilter.frequency.value = 520;
    tireFilter.Q.value = 0.45;
    tireGain.gain.value = 0.004;
    tireSource.connect(tireFilter).connect(tireGain).connect(master);
    engine.start(now);
    tireSource.start(now);
    audio.driving = { engine, engineGain, tireSource, tireGain };
    updateDrivingAudio(runProgress);
  };

  const playThunder = () => {
    const audio = audioRef.current;
    if (!audio || audio.context.state !== "running") return;
    const now = audio.context.currentTime;
    const osc = audio.context.createOscillator();
    const gain = audio.context.createGain();
    const filter = audio.context.createBiquadFilter();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(78, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 1.8);
    filter.type = "lowpass";
    filter.frequency.value = 230;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    osc.connect(filter).connect(gain).connect(audio.master);
    osc.start(now);
    osc.stop(now + 2.3);
  };

  const startWeatherAudio = (mode: "clear" | "rain" | "fog") => {
    if (!isSoundOn) return;
    const audio = audioRef.current;
    if (!audio) return;
    stopWeatherAudio();
    if (mode === "clear") return;
    const { context, master } = audio;
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = mode === "rain" ? "lowpass" : "bandpass";
    filter.frequency.value = mode === "rain" ? 1250 : 420;
    filter.Q.value = mode === "rain" ? 0.45 : 0.7;
    gain.gain.value = mode === "rain" ? 0.055 : 0.035;
    source.connect(filter).connect(gain).connect(master);
    source.start();
    audio.ambience = { source, filter, gain };
    if (mode === "fog") {
      const scheduleThunder = () => {
        if (!audioRef.current || !isSoundOn || mode !== "fog") return;
        playThunder();
        audio.thunderTimer = window.setTimeout(scheduleThunder, 9000 + Math.random() * 9000);
      };
      audio.thunderTimer = window.setTimeout(scheduleThunder, 4500 + Math.random() * 5000);
    }
  };

  const toggleWeatherSound = () => {
    if (isSoundOn) {
      stopWeatherAudio();
      stopDrivingAudio();
      audioRef.current?.master.gain.setTargetAtTime(0, audioRef.current.context.currentTime, 0.08);
      audioRef.current?.master.disconnect();
      setIsSoundOn(false);
      return;
    }
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = audioRef.current?.context ?? new AudioContextClass();
    const master = audioRef.current?.master ?? context.createGain();
    master.gain.setTargetAtTime(0.7, context.currentTime, 0.08);
    master.connect(context.destination);
    audioRef.current = { context, master };
    void context.resume().then(() => { setIsSoundOn(true); startDrivingAudio(); startWeatherAudio(weather); });
  };

  useEffect(() => () => { stopWeatherAudio(); stopDrivingAudio(); audioRef.current?.context.close(); audioRef.current = null; }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const sectionObserver = new IntersectionObserver(([entry]) => {
      activeRef.current = entry.isIntersecting;
      setIsActive(entry.isIntersecting);
      if (entry.isIntersecting) updateProgress();
    }, { rootMargin: "300px 0px 300px 0px" });
    const updateProgress = () => {
      if (!activeRef.current) return;
      const start = scene.offsetTop - window.innerHeight * 0.72;
      const end = scene.offsetTop + scene.offsetHeight - window.innerHeight * 0.28;
      const nextProgress = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
      setRunProgress(nextProgress);
      updateDrivingAudio(nextProgress);
    };
    sectionObserver.observe(scene);
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => { sectionObserver.disconnect(); window.removeEventListener("scroll", updateProgress); window.removeEventListener("resize", updateProgress); };
  }, []);

  return <section className={`night-run-section ${isActive ? "is-active" : ""}`} id="night-run" ref={sceneRef}>
    <div className="container night-run-layout">
      <div className="night-run-copy"><ScrollReveal><div className="eyebrow"><span className="eyebrow-line" /> THE ROAD DOESN'T CLOCK OUT</div><h2>Some loads move<br /><em>after dark.</em></h2><p>Scroll to send the truck into the night. Headlights lead the lane, markers streak by, and the dispatch desk stays close until the wheels stop.</p><div className="night-run-readout"><span>RUN STATUS</span><strong>{runProgress < .32 ? "PULLING OUT" : runProgress < .7 ? "IN MOTION" : "LIGHTS AHEAD"}</strong><i><b style={{ width: `${Math.max(8, runProgress * 100)}%` }} /></i></div></ScrollReveal></div>
      <div className={`night-run-scene ${isDay ? "night-run-day" : ""} condition-${weather}`} style={{ "--night-progress": runProgress } as CSSProperties} aria-label={`${isDay ? "Daytime" : "Nighttime"} ${weather} truck journey scene`}>
        <div className="night-run-controls"><button className="lighting-toggle" type="button" onClick={() => setIsDay((current) => !current)} aria-pressed={isDay}><span className="lighting-toggle-icon">{isDay ? "☀" : "☾"}</span><span>{isDay ? "Day view" : "Night view"}</span><i><b /></i></button><div className="weather-control-row"><div className="weather-toggle" role="group" aria-label="Weather conditions">{(["clear", "rain", "fog"] as const).map((mode) => <button key={mode} className={weather === mode ? "is-selected" : ""} type="button" onClick={() => { setWeather(mode); if (isSoundOn) startWeatherAudio(mode); }} aria-pressed={weather === mode}>{mode === "clear" ? "Clear" : mode === "rain" ? "Rain" : "Fog"}</button>)}</div><button className={`weather-sound-toggle ${isSoundOn ? "is-on" : ""}`} type="button" onClick={toggleWeatherSound} aria-pressed={isSoundOn} aria-label={isSoundOn ? "Mute weather sounds" : "Play weather sounds"} title={isSoundOn ? "Mute weather sounds" : "Play weather sounds"}>{isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}</button></div></div>
        <div className="weather-rain-layer" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div><div className="weather-fog weather-fog-one" aria-hidden="true" /><div className="weather-fog weather-fog-two" aria-hidden="true" />
        <div className="night-moon" /><div className="night-city"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="night-lamp night-lamp-one"><i /></div><div className="night-lamp night-lamp-two"><i /></div><div className="night-lamp night-lamp-three"><i /></div>
        <div className="night-road"><span /><span /><span /><span /><span /><span /></div>
        <div className="night-truck"><div className="night-truck-cab"><i className="night-beam beam-one" /><i className="night-beam beam-two" /><b className="night-lamp-glow" /></div><div className="night-truck-box"><b>AL</b><span /></div><i className="night-wheel one" /><i className="night-wheel two" /><i className="night-redlight" /></div>
        <div className="night-mile-marker"><small>TX 20</small><b>WEST</b></div>
        <div className="night-run-caption"><span className="live-dot" /> LIVE ROAD VIEW <b>{String(Math.round(runProgress * 100)).padStart(2, "0")}%</b></div>
      </div>
    </div>
  </section>;
}

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [stuck, setStuck] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState("");
  const [activeSection, setActiveSection] = useState("services");
  const heroSceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionIds = ["services", "journey", "advantage", "process", "reviews", "contact"];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { threshold: [0.15, 0.35, 0.6], rootMargin: "-18% 0px -55% 0px" });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      setStuck(window.scrollY > 90);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const selector = ".service-card, .scope-item, .audience-card, .testimonial-card";
    let active: HTMLElement | null = null;
    const reset = (el: HTMLElement | null) => { if (!el) return; el.classList.remove("is-tilting"); el.style.removeProperty("--tilt-x"); el.style.removeProperty("--tilt-y"); };
    const onMove = (event: Event) => {
      const e = event as globalThis.PointerEvent;
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest<HTMLElement>(selector);
      if (el !== active) { reset(active); active = el; }
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.classList.add("is-tilting");
      el.style.setProperty("--tilt-x", `${(0.5 - py) * 9}deg`);
      el.style.setProperty("--tilt-y", `${(px - 0.5) * 11}deg`);
      el.style.setProperty("--glare-x", `${px * 100}%`);
      el.style.setProperty("--glare-y", `${py * 100}%`);
    };
    const onLeave = () => { reset(active); active = null; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); reset(active); };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.website) return; // honeypot: bots fill this, people never see it

    const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
    if (!endpoint) {
      const body = [`Name: ${data.name}`, `Company: ${data.company || "-"}`, `Phone: ${data.phone}`, `Email: ${data.email}`, `Truck type: ${data.truckType || "-"}`, `MC number: ${data.mc || "-"}`, "", data.message || ""].join("\n");
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Dispatch request from ${data.name}`)}&body=${encodeURIComponent(body)}`;
      setSubmitted(true);
      return;
    }

    setSending(true);
    setFormError("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...data, source: SITE_URL }) });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setSubmitted(true);
    } catch {
      setFormError(`Something went wrong sending your request. Please call ${PHONE} or email ${EMAIL}.`);
    } finally {
      setSending(false);
    }
  };

  const closeMenu = () => setMobileOpen(false);

  const handleHeroPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !heroSceneRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroSceneRef.current.style.setProperty("--hero-rotate-x", `${y * -8}deg`);
    heroSceneRef.current.style.setProperty("--hero-rotate-y", `${x * 10}deg`);
    heroSceneRef.current.style.setProperty("--hero-shift-x", `${x * 8}px`);
    heroSceneRef.current.style.setProperty("--hero-shift-y", `${y * 6}px`);
  };

  const resetHeroPointer = () => {
    if (!heroSceneRef.current) return;
    heroSceneRef.current.style.setProperty("--hero-rotate-x", "0deg");
    heroSceneRef.current.style.setProperty("--hero-rotate-y", "0deg");
    heroSceneRef.current.style.setProperty("--hero-shift-x", "0px");
    heroSceneRef.current.style.setProperty("--hero-shift-y", "0px");
  };

  return (
    <div className="site-shell" id="top">
      <div className="top-strip">
        <div className="top-strip-inner">
          <span className="live-dot" />
          <span>DISPATCH DESK ONLINE</span>
          <span className="strip-divider" />
          <span>24/7 CARRIER SUPPORT</span>
          <a href={`tel:${PHONE_DIGITS}`} className="strip-phone">{PHONE} <ArrowUpRight size={13} /></a>
        </div>
      </div>

      <div className="scroll-progress" aria-hidden="true"><div ref={progressRef} /></div>

      <header className={`site-nav ${mobileOpen ? "nav-open" : ""} ${stuck ? "nav-stuck" : ""}`}>
        <div className="nav-inner">
          <BrandMark />
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a className={activeSection === "services" ? "nav-active" : ""} href="#services">What we dispatch</a>
            <a className={activeSection === "journey" ? "nav-active" : ""} href="#journey">Load journey</a>
            <a className={activeSection === "advantage" ? "nav-active" : ""} href="#advantage">Why us</a>
            <a className={activeSection === "process" ? "nav-active" : ""} href="#process">How it works</a>
            <a className={activeSection === "reviews" ? "nav-active" : ""} href="#reviews">Carrier reviews</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-call" href={`tel:${PHONE_DIGITS}`}><Phone size={15} /> <span>Call dispatch</span></a>
            <a className="button button-small button-amber" href="#contact">Get started <ArrowUpRight size={15} /></a>
            <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close navigation" : "Open navigation"}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <div className="mobile-nav" aria-hidden={!mobileOpen}>
          <a className={activeSection === "services" ? "nav-active" : ""} href="#services" onClick={closeMenu}>What we dispatch <ArrowRight size={16} /></a>
          <a className={activeSection === "journey" ? "nav-active" : ""} href="#journey" onClick={closeMenu}>Load journey <ArrowRight size={16} /></a>
          <a className={activeSection === "advantage" ? "nav-active" : ""} href="#advantage" onClick={closeMenu}>Why us <ArrowRight size={16} /></a>
          <a className={activeSection === "process" ? "nav-active" : ""} href="#process" onClick={closeMenu}>How it works <ArrowRight size={16} /></a>
          <a className={activeSection === "reviews" ? "nav-active" : ""} href="#reviews" onClick={closeMenu}>Carrier reviews <ArrowRight size={16} /></a>
          <a className="button button-amber" href="#contact" onClick={closeMenu}>Talk to a dispatcher <ArrowUpRight size={16} /></a>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-grid-texture" />
          <div className="container hero-content">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> CARRIER-FIRST DISPATCHING <span className="eyebrow-index">/ 01</span></div>
              <h1>More miles.<br /><em>Less mayhem.</em></h1>
              <p className="hero-lede">The dispatch desk built for owners who want their truck moving — and their business under control.</p>
              <div className="hero-actions">
                <a className="button button-amber button-large" href="#contact">Put my truck to work <ArrowUpRight size={18} /></a>
                <a className="text-link" href={`tel:${PHONE_DIGITS}`}><span className="play-icon"><Phone size={14} /></span> Talk to a dispatcher</a>
              </div>
              <div className="hero-proof">
                <div className="proof-avatars"><span>MT</span><span>JR</span><span>DW</span><b>+</b></div>
                <div><strong>Built around your run</strong><small>Real people. Real updates. 24/7.</small></div>
              </div>
            </div>

            <div className="hero-visual" aria-label="3D illustration of a truck route" onPointerMove={handleHeroPointerMove} onPointerLeave={resetHeroPointer}>
              <div className="hero-scene" ref={heroSceneRef}>
              <div className="visual-kicker"><span>LIVE NETWORK</span><b>01:42:08</b></div>
              <div className="hero-map-plane">
                <div className="map-line map-line-a" />
                <div className="map-line map-line-b" />
                <div className="map-line map-line-c" />
                <div className="map-node node-a"><span />DALLAS</div>
                <div className="map-node node-b"><span />ATLANTA</div>
                <div className="map-node node-c"><span />DENVER</div>
                <div className="map-node node-d"><span />PHOENIX</div>
              </div>
              <div className="road-plane" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div className="road-glow road-glow-left" aria-hidden="true" />
              <div className="road-glow road-glow-right" aria-hidden="true" />
              <div className="convoy convoy-back convoy-back-one" aria-hidden="true"><span className="convoy-cab" /><span className="convoy-trailer" /></div>
              <div className="convoy convoy-back convoy-back-two" aria-hidden="true"><span className="convoy-cab" /><span className="convoy-trailer" /></div>
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="truck-shadow" />
              <div className="truck-visual">
                <div className="truck-cab"><span className="truck-window" /><span className="truck-grille" /><span className="truck-headlight" /></div>
                <div className="truck-hood" />
                <div className="truck-trailer"><span className="trailer-stripe" /><span className="trailer-label">AL</span><span className="trailer-door" /></div>
                <div className="truck-wheel wheel-front" /><div className="truck-wheel wheel-mid" /><div className="truck-wheel wheel-back" />
              </div>
              <div className="visual-card visual-card-top"><span className="card-pulse"><Zap size={13} /></span><div><small>LOAD MATCH</small><strong>98.6%</strong></div></div>
              <div className="visual-card visual-card-bottom"><div className="route-mini"><span /><span /><span /></div><div><small>NEXT MOVE</small><strong>READY TO ROLL</strong></div><ArrowUpRight size={16} /></div>
              <div className="visual-rings" />
              </div>
            </div>
          </div>
          <div className="hero-bottom-line container"><span>TX</span><i /><span>GA</span><i /><span>CO</span><i /><span>AZ</span><small>ROUTES THAT MOVE WITH YOU</small></div>
        </section>

        <section className="signal-band" aria-label="Dispatch services summary">
          <div className="signal-track">
            {['LOAD SOURCING', 'RATE NEGOTIATION', 'BROKER COMMS', 'PAPERWORK', 'ROUTE PLANNING', 'LOAD SOURCING', 'RATE NEGOTIATION', 'BROKER COMMS'].map((item, index) => <span key={`${item}-${index}`}>{item}<b>✦</b></span>)}
          </div>
        </section>

        <section className="stats-strip" aria-label="American Logistics at a glance">
          <div className="container stats-grid">
            {stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
          </div>
        </section>

        <section className="section section-light" id="services">
          <div className="container">
            <div className="section-heading split-heading">
              <div><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> THE RIGHT FREIGHT, ON YOUR TERMS</div><h2>Whatever you haul,<br /><em>we keep it moving.</em></h2></div>
              <div className="heading-side"><p>We pair your equipment with freight that fits your business — not someone else’s playbook.</p><a className="text-link dark-link" href="#contact">Tell us what you run <ArrowRight size={16} /></a></div>
            </div>
            <div className="service-grid">
              {services.map((service, index) => {
                const Icon = service.icon;
                return <article className="service-card" key={service.title}><div className="card-topline"><span>0{index + 1}</span><Icon size={22} strokeWidth={1.5} /></div><h3>{service.title}</h3><p>{service.copy}</p><a href="#contact" aria-label={`Learn more about ${service.title}`}><ArrowUpRight size={18} /></a></article>;
              })}
            </div>
          </div>
        </section>

        <FreightFit />

        <LoadToLaunch />

        <NightRun />

        <section className="section section-navy" id="advantage">
          <div className="advantage-grid-texture" />
          <div className="container">
            <ScrollReveal className="section-heading split-heading light-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" /> THE AMERICAN LOGISTICS DIFFERENCE</div><h2>Not a load board.<br /><em>A better operating rhythm.</em></h2></div>
              <div className="heading-side"><p>Your truck is your business. We bring a sharper eye to every load, every call, and every mile.</p><a className="text-link" href="#process">See the process <ArrowRight size={16} /></a></div>
            </ScrollReveal>
            <ScrollReveal className="benefit-layout" delay={80}>
              <div className="benefit-intro"><div className="big-number">24<span>/</span>7</div><p>Support that stays awake when the road does.</p><div className="signal-bars"><i /><i /><i /><i /><i /></div><small>LIVE DISPATCH SIGNAL</small></div>
              <div className="benefit-grid">
                {benefits.map((benefit) => { const Icon = benefit.icon; return <article className="benefit-item" key={benefit.title}><div className="benefit-icon"><Icon size={19} /></div><div><h3>{benefit.title}</h3><p>{benefit.copy}</p></div></article>; })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="section section-sand scope-section" id="scope">
          <div className="container">
            <ScrollReveal className="section-heading split-heading">
              <div><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> WHAT WE HANDLE</div><h2>Everything between<br /><em>booked and paid.</em></h2></div>
              <div className="heading-side"><p>One dispatch desk covering the calls, paperwork and planning that eat your day.</p><a className="text-link dark-link" href="#contact">Get started <ArrowRight size={16} /></a></div>
            </ScrollReveal>
            <ScrollReveal className="scope-grid" delay={80}>
              {scope.map((item) => { const Icon = item.icon; return <article className="scope-item" key={item.title}><span className="scope-icon"><Icon size={20} strokeWidth={1.6} /></span><h3>{item.title}</h3><p>{item.copy}</p></article>; })}
            </ScrollReveal>
            <ScrollReveal className="audience-block" delay={120}>
              <div className="audience-heading"><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> WHO WE WORK WITH</div><h3>Built for carriers of every size.</h3></div>
              <div className="audience-grid">
                {audiences.map((item) => { const Icon = item.icon; return <article className="audience-card" key={item.title}><Icon size={22} strokeWidth={1.5} /><h4>{item.title}</h4><p>{item.copy}</p></article>; })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="section section-navy coverage-section" id="coverage">
          <div className="advantage-grid-texture" />
          <div className="container coverage-layout">
            <ScrollReveal className="coverage-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> COAST-TO-COAST LANES</div>
              <h2>Freight that follows<br /><em>your map.</em></h2>
              <p>From Texas to the Southeast, the Southwest to the Midwest, we build around the lanes you actually want to run — and keep the next load lined up before the current one ends.</p>
              <ul className="coverage-list">
                {["Dallas", "Houston", "Atlanta", "Chicago", "Phoenix", "Denver", "Los Angeles", "New York"].map((city) => <li key={city}><i />{city}</li>)}
              </ul>
              <a className="button button-amber" href="#contact">Plan my lanes <ArrowUpRight size={16} /></a>
            </ScrollReveal>
            <ScrollReveal className="coverage-visual" delay={120}>
              <LazyGlobe />
              <div className="globe-hint"><span /> Drag to explore the network</div>
            </ScrollReveal>
          </div>
        </section>

        <section className="section section-light process-section" id="process">
          <div className="container">
            <ScrollReveal className="section-heading center-heading"><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> SIMPLE BY DESIGN</div><h2>Your next move,<br /><em>handled.</em></h2><p>One clear partner from the first call to the final proof of delivery.</p></ScrollReveal>
            <ScrollReveal className="process-grid" delay={80}>
              {steps.map((step, index) => <article className={`process-step ${index === steps.length - 1 ? "process-step-last" : ""}`} key={step.number}><div className="step-number">{step.number}</div><div className="step-connector" /><h3>{step.title}</h3><p>{step.copy}</p></article>)}
            </ScrollReveal>
            <ScrollReveal className="process-callout" delay={160}><div className="callout-mark"><CircleCheck size={22} /></div><p><strong>Good dispatch feels quiet.</strong> You get clear options, fast answers, and the confidence to keep rolling.</p><a className="button button-dark" href="#contact">Build my dispatch plan <ArrowUpRight size={16} /></a></ScrollReveal>
          </div>
        </section>

        <section className="section section-sand support-section">
          <div className="container support-layout">
            <ScrollReveal className="support-visual">
              <div className="support-map-lines"><i /><i /><i /><i /></div>
              <div className="support-route"><span className="route-start">START</span><div className="route-path" /><span className="route-end">NEXT LOAD</span></div>
              <div className="support-orb"><Clock3 size={28} /><strong>24/7</strong><small>ON CALL</small></div>
              <div className="support-ticket"><span className="ticket-dot" /><div><small>DISPATCH TICKET</small><strong>Broker update received</strong></div><BadgeCheck size={19} /></div>
            </ScrollReveal>
            <ScrollReveal className="support-copy" delay={100}><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> WHEN THE ROAD GETS LOUD</div><h2>Someone in your corner,<br /><em>every mile.</em></h2><p>Weather shifts. Brokers go quiet. A pickup window moves. That is where a dispatch partner proves their value — with calm, useful communication that keeps a small problem from becoming a lost day.</p><div className="support-points"><div><CircleCheck size={18} /><span>Fast answers when plans change</span></div><div><CircleCheck size={18} /><span>One point of contact for the moving parts</span></div><div><CircleCheck size={18} /><span>Updates you can actually act on</span></div></div><a className="text-link dark-link" href={`tel:${PHONE_DIGITS}`}>Call the desk <ArrowRight size={16} /></a></ScrollReveal>
          </div>
        </section>

        <section className="section section-light reviews-section" id="reviews">
          <div className="container">
            <ScrollReveal className="reviews-header"><div><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> FROM THE DRIVER'S SEAT</div><h2>Good words from<br /><em>good operators.</em></h2></div><div className="rating-lockup"><div className="stars"><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /></div><strong>Built on communication</strong><small>Carrier relationships that go the distance.</small></div></ScrollReveal>
            <ScrollReveal className="testimonial-grid" delay={80}>{testimonials.map((testimonial) => <article className="testimonial-card" key={testimonial.name}><Quote className="quote-mark" size={27} /><p>“{testimonial.quote}”</p><div className="testimonial-meta"><span>{testimonial.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{testimonial.name}</strong><small>{testimonial.meta}</small></div></div></article>)}</ScrollReveal>
          </div>
        </section>

        <section className="section section-navy faq-section">
          <div className="container faq-layout">
            <ScrollReveal className="faq-copy"><div className="eyebrow"><span className="eyebrow-line" /> NO SMALL PRINT ENERGY</div><h2>Questions before<br /><em>you roll?</em></h2><p className="faq-intro">No pressure, no runaround. Here are a few things carriers usually ask first.</p><a className="button button-amber" href={`mailto:${EMAIL}`}>Email the desk <Mail size={16} /></a></ScrollReveal>
            <ScrollReveal className="faq-list" delay={100}>{faqs.map((faq, index) => <div className={`faq-item ${activeFaq === index ? "faq-active" : ""}`} key={faq.question}><button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} aria-expanded={activeFaq === index}><span>{faq.question}</span><ChevronDown size={18} /></button>{activeFaq === index && <p>{faq.answer}</p>}</div>)}</ScrollReveal>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="container contact-layout">
            <ScrollReveal className="contact-copy"><div className="eyebrow"><span className="eyebrow-line" /> READY WHEN YOU ARE</div><h2>Put your truck<br /><em>in motion.</em></h2><p>Tell us a little about your operation. We will come back with a clear next step — not a hard sell.</p><div className="contact-details"><a href={`tel:${PHONE_DIGITS}`}><span><Phone size={17} /></span><div><small>CALL THE DISPATCH DESK</small><strong>{PHONE}</strong></div></a><a href={`mailto:${EMAIL}`}><span><Mail size={17} /></span><div><small>EMAIL THE TEAM</small><strong>{EMAIL}</strong></div></a></div></ScrollReveal>
            <ScrollReveal className="lead-form-wrap" delay={120}>{submitted ? <div className="form-success"><div className="success-icon"><CircleCheck size={30} /></div><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> REQUEST RECEIVED</div><h3>You're on the radar.</h3><p>Thanks for reaching out. An American Logistics team member will connect with you soon. If you need us now, call <a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a>.</p><button className="button button-dark" onClick={() => setSubmitted(false)}>Send another request <ArrowRight size={16} /></button></div> : <form className="lead-form" onSubmit={handleSubmit}><div className="form-heading"><span>01</span><div><small>START A CONVERSATION</small><h3>Let's talk trucks.</h3></div></div><div className="form-row"><label>Full name<input required name="name" placeholder="Your name" /></label><label>Company<input name="company" placeholder="Company name" /></label></div><div className="form-row"><label>Phone<input required type="tel" name="phone" placeholder="(000) 000-0000" /></label><label>Email<input required type="email" name="email" placeholder="you@company.com" /></label></div><div className="form-row"><label>Truck type<select name="truckType" defaultValue=""><option value="" disabled>Select equipment</option><option>Box truck</option><option>Dry van</option><option>Reefer</option><option>Flatbed</option><option>Hotshot</option><option>Other</option></select></label><label>MC number<input name="mc" placeholder="Optional" /></label></div><label>What are you looking for?<textarea name="message" placeholder="Tell us about your lanes, home time, or what is not working today..." rows={3} /></label><input className="hp-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />{formError && <p className="form-error" role="alert">{formError}</p>}<button className="button button-amber button-submit" type="submit" disabled={sending}>{sending ? "Sending…" : "Get my dispatch options"} <ArrowUpRight size={17} /></button><small className="form-note">By submitting, you are asking American Logistics to contact you about dispatch support.</small></form>}</ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand"><BrandMark /><p>Freight dispatching for owner-operators and small fleets who want a clearer road ahead.</p></div>
          <div className="footer-col"><h4>Explore</h4><a href="#services">Services</a><a href="#scope">What we handle</a><a href="#coverage">Coverage</a><a href="#process">How it works</a><a href="#advantage">Why us</a></div>
          <div className="footer-col"><h4>Contact</h4><a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a><a href={SITE_URL}>americanlogistics.online</a></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} American Logistics. All rights reserved.</span><span>U.S. carrier support · Built to keep you moving</span><a href="#top">Back to top <ArrowUpRight size={13} /></a></div>
      </footer>

      <div className="mobile-cta" role="region" aria-label="Quick contact">
        <a className="mobile-cta-call" href={`tel:${PHONE_DIGITS}`}><Phone size={17} /> Call now</a>
        <a className="mobile-cta-quote" href="#contact">Get started <ArrowUpRight size={16} /></a>
      </div>
    </div>
  );
}

export default Home;
