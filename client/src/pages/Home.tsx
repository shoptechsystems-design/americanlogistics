import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Box,
  ChevronDown,
  Check,
  Layers,
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
const TruckScene = lazy(() => import("@/components/TruckScene"));
const EquipmentViewer = lazy(() => import("@/components/EquipmentViewer"));

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

type EquipmentKey = "box-truck" | "dry-van" | "reefer" | "flatbed";

const equipment: {
  key: EquipmentKey; label: string; tagline: string; icon: typeof Box; summary: string;
  freight: string[]; bestFor: string; lanes: string;
}[] = [
  { key: "box-truck", label: "Box truck", tagline: "Local & regional", icon: Box, summary: "Flexible freight that fits shorter turns, so you can keep home time while keeping the truck busy.", freight: ["Palletized freight", "Furniture & appliances", "Last-mile delivery", "Retail restocking"], bestFor: "Regional & last-mile", lanes: "Dallas · Atlanta · Houston" },
  { key: "dry-van", label: "Dry van", tagline: "Over-the-road", icon: Truck, summary: "Steady lanes, clear broker communication, and rate support from pickup through delivery.", freight: ["Packaged goods", "Retail & e-commerce", "Non-perishable food", "Paper & consumer products"], bestFor: "Consistent long-haul", lanes: "I-20 · I-40 · I-10" },
  { key: "reefer", label: "Reefer", tagline: "Temperature-controlled", icon: Snowflake, summary: "Time-critical loads coordinated around appointment windows, with check calls handled for you.", freight: ["Fresh produce", "Frozen food", "Dairy & beverages", "Pharmaceuticals"], bestFor: "Temperature-sensitive", lanes: "Southwest · Southeast" },
  { key: "flatbed", label: "Flatbed / hotshot", tagline: "Open-deck & specialized", icon: Layers, summary: "Equipment-aware sourcing for open-deck, project and expedited freight that needs the right setup.", freight: ["Lumber & building materials", "Steel & pipe", "Machinery & equipment", "Oversize & project loads"], bestFor: "Specialized & urgent", lanes: "Texas · Oklahoma · Midwest" },
];

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

function LazyTruck() {
  const holderRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!holderRef.current || !("IntersectionObserver" in window)) { setNear(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: "600px 0px" });
    observer.observe(holderRef.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={holderRef} className="truck-lazy">{near && <Suspense fallback={<div className="truck-loading"><span>Loading 3D scene…</span></div>}><TruckScene /></Suspense>}</div>;
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

function LazyEquipment({ equipmentKey }: { equipmentKey: EquipmentKey }) {
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

  return <div ref={holderRef} className="equip-lazy">{near && <Suspense fallback={<div className="truck-loading"><span>Loading 3D model…</span></div>}><EquipmentViewer equipment={equipmentKey} /></Suspense>}</div>;
}

function FreightFit() {
  const [activeKey, setActiveKey] = useState<EquipmentKey>("box-truck");
  const active = equipment.find((item) => item.key === activeKey) ?? equipment[0];
  const ActiveIcon = active.icon;

  return <section className="freight-fit-section" id="freight-fit">
    <div className="container">
      <ScrollReveal className="freight-fit-heading">
        <div><div className="eyebrow"><span className="eyebrow-line" /> PICK YOUR EQUIPMENT</div><h2>What do you drive?<br /><em>We find what fits.</em></h2></div>
        <p>Choose your equipment to see the kind of freight and lanes we line up for it. Every setup gets a different dispatch plan.</p>
      </ScrollReveal>
      <div className="equip-tabs" role="tablist" aria-label="Equipment types">
        {equipment.map((item, index) => { const Icon = item.icon; return <button key={item.key} role="tab" aria-selected={activeKey === item.key} className={activeKey === item.key ? "is-active" : ""} onClick={() => setActiveKey(item.key)}><span className="equip-tab-number">0{index + 1}</span><Icon size={22} strokeWidth={1.6} /><strong>{item.label}</strong><small>{item.tagline}</small></button>; })}
      </div>
      <div className="equip-panel" role="tabpanel">
        <div className="equip-viewer">
          <LazyEquipment equipmentKey={activeKey} />
          <span className="equip-badge"><ActiveIcon size={15} /> {active.label}</span>
          <span className="equip-hint"><i /> Drag to rotate</span>
        </div>
        <div className="equip-info">
          <div className="equip-kicker"><span className="live-dot" /> WHAT WE DISPATCH FOR YOU</div>
          <h3>{active.label}</h3>
          <p>{active.summary}</p>
          <div className="equip-freight"><small>TYPICAL FREIGHT</small><ul>{active.freight.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul></div>
          <div className="equip-facts"><div><small>BEST FOR</small><strong>{active.bestFor}</strong></div><div><small>COMMON LANES</small><strong>{active.lanes}</strong></div></div>
          <a className="button button-amber" href="#contact">Get a {active.label.toLowerCase()} plan <ArrowUpRight size={16} /></a>
        </div>
      </div>
      <div className="freight-fit-service-area"><span>SERVICE AREA</span><strong>U.S. carrier support</strong><i /><span>LOCAL · REGIONAL · OTR</span><b>Dallas</b><b>Atlanta</b><b>Houston</b><b>Oklahoma City</b><b>Beyond</b></div>
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

  useEffect(() => {
    const sectionIds = ["services", "scope", "coverage", "process", "reviews", "contact"];
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
            <a className={activeSection === "scope" ? "nav-active" : ""} href="#scope">What we handle</a>
            <a className={activeSection === "coverage" ? "nav-active" : ""} href="#coverage">Coverage</a>
            <a className={activeSection === "process" ? "nav-active" : ""} href="#process">How it works</a>
            <a className={activeSection === "reviews" ? "nav-active" : ""} href="#reviews">Reviews</a>
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
          <a className={activeSection === "scope" ? "nav-active" : ""} href="#scope" onClick={closeMenu}>What we handle <ArrowRight size={16} /></a>
          <a className={activeSection === "coverage" ? "nav-active" : ""} href="#coverage" onClick={closeMenu}>Coverage <ArrowRight size={16} /></a>
          <a className={activeSection === "process" ? "nav-active" : ""} href="#process" onClick={closeMenu}>How it works <ArrowRight size={16} /></a>
          <a className={activeSection === "reviews" ? "nav-active" : ""} href="#reviews" onClick={closeMenu}>Reviews <ArrowRight size={16} /></a>
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
                <div><strong>Built around your run</strong><small>Real people. Real updates. 24/7.</small></div>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="hero-scene">
                <div className="visual-card visual-card-top"><span className="card-pulse"><Zap size={13} /></span><div><small>DISPATCH DESK</small><strong>ONLINE · 24/7</strong></div></div>
                <div className="visual-card visual-card-bottom"><div className="route-mini"><span /><span /><span /></div><div><small>NEXT MOVE</small><strong>READY TO ROLL</strong></div><ArrowUpRight size={16} /></div>
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

        <section className="truck-section" id="rolling" aria-label="Interactive 3D truck">
          <LazyTruck />
          <div className="container truck-overlay">
            <ScrollReveal className="truck-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> ALWAYS ROLLING</div>
              <h2>Momentum is<br /><em>the whole game.</em></h2>
              <p>Every idle hour costs you money. We keep the next load lined up so your wheels keep turning. Scroll to hit the gas, or switch the camera angle.</p>
              <a className="button button-amber" href="#contact">Keep my truck rolling <ArrowUpRight size={16} /></a>
            </ScrollReveal>
          </div>
        </section>

        <FreightFit />

        <section className="section section-sand scope-section" id="scope">
          <div className="container">
            <ScrollReveal className="section-heading split-heading">
              <div><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> WHAT WE HANDLE</div><h2>Everything between<br /><em>booked and paid.</em></h2></div>
              <div className="heading-side"><p>One dispatch desk covering the calls, paperwork and planning that eat your day.</p><a className="text-link dark-link" href="#contact">Get started <ArrowRight size={16} /></a></div>
            </ScrollReveal>
            <ScrollReveal className="scope-grid" delay={80}>
              {scope.map((item, index) => { const Icon = item.icon; return <article className="scope-item" key={item.title}><span className="scope-index">{String(index + 1).padStart(2, "0")}</span><span className="scope-icon"><Icon size={20} strokeWidth={1.6} /></span><h3>{item.title}</h3><p>{item.copy}</p></article>; })}
            </ScrollReveal>
            <ScrollReveal className="audience-block" delay={120}>
              <div className="audience-heading"><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> WHO WE WORK WITH</div><h3>Built for carriers of every size.</h3></div>
              <div className="audience-grid">
                {audiences.map((item) => { const Icon = item.icon; return <article className="audience-card" key={item.title}><Icon size={22} strokeWidth={1.5} /><h4>{item.title}</h4><p>{item.copy}</p></article>; })}
              </div>
            </ScrollReveal>
            <ScrollReveal className="scope-cta" delay={140}>
              <div><strong>Not sure what you need?</strong><span>Tell us about your truck and we will map out the right dispatch setup.</span></div>
              <a className="button button-dark" href="#contact">Talk to a dispatcher <ArrowUpRight size={16} /></a>
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
            <ScrollReveal className="contact-copy"><div className="eyebrow"><span className="eyebrow-line" /> READY WHEN YOU ARE</div><h2>Put your truck<br /><em>in motion.</em></h2><p>Tell us a little about your operation. We will come back with a clear next step — not a hard sell.</p><div className="contact-details"><a href={`tel:${PHONE_DIGITS}`}><span><Phone size={17} /></span><div><small>CALL THE DISPATCH DESK</small><strong>{PHONE}</strong></div></a><a href={`mailto:${EMAIL}`}><span><Mail size={17} /></span><div><small>EMAIL THE TEAM</small><strong>{EMAIL}</strong></div></a><div className="contact-hours"><span><Clock3 size={17} /></span><div><small>DISPATCH DESK</small><strong>Open 24/7</strong></div></div></div><div className="contact-next"><small>WHAT HAPPENS NEXT</small><ol><li><b>01</b><span>We review your request and reach out.</span></li><li><b>02</b><span>A short call to learn your truck, lanes and goals.</span></li><li><b>03</b><span>We start lining up freight that fits.</span></li></ol></div></ScrollReveal>
            <ScrollReveal className="lead-form-wrap" delay={120}>{submitted ? <div className="form-success"><div className="success-icon"><CircleCheck size={30} /></div><div className="eyebrow eyebrow-dark"><span className="eyebrow-line" /> REQUEST RECEIVED</div><h3>You're on the radar.</h3><p>Thanks for reaching out. An American Logistics team member will connect with you soon. If you need us now, call <a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a>.</p><button className="button button-dark" onClick={() => setSubmitted(false)}>Send another request <ArrowRight size={16} /></button></div> : <form className="lead-form" onSubmit={handleSubmit}><div className="form-heading"><span>01</span><div><small>START A CONVERSATION</small><h3>Let's talk trucks.</h3></div></div><div className="form-row"><label>Full name<input required name="name" placeholder="Your name" /></label><label>Company<input name="company" placeholder="Company name" /></label></div><div className="form-row"><label>Phone<input required type="tel" name="phone" placeholder="(000) 000-0000" /></label><label>Email<input required type="email" name="email" placeholder="you@company.com" /></label></div><div className="form-row"><label>Truck type<select name="truckType" defaultValue=""><option value="" disabled>Select equipment</option><option>Box truck</option><option>Dry van</option><option>Reefer</option><option>Flatbed</option><option>Hotshot</option><option>Other</option></select></label><label>MC number<input name="mc" placeholder="Optional" /></label></div><label>What are you looking for?<textarea name="message" placeholder="Tell us about your lanes, home time, or what is not working today..." rows={3} /></label><input className="hp-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />{formError && <p className="form-error" role="alert">{formError}</p>}<button className="button button-amber button-submit" type="submit" disabled={sending}>{sending ? "Sending…" : "Get my dispatch options"} <ArrowUpRight size={17} /></button><small className="form-note">By submitting, you are asking American Logistics to contact you about dispatch support.</small></form>}</ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand"><BrandMark /><p>Freight dispatching for owner-operators and small fleets who want a clearer road ahead.</p></div>
          <div className="footer-col"><h4>Explore</h4><a href="#services">Services</a><a href="#scope">What we handle</a><a href="#coverage">Coverage</a><a href="#process">How it works</a><a href="#reviews">Reviews</a></div>
          <div className="footer-col"><h4>Contact</h4><a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
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
