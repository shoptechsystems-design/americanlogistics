import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CircleCheck,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  Handshake,
  Headset,
  LoaderCircle,
  Mail,
  Menu,
  MessagesSquare,
  Phone,
  Search,
  Truck,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * Verified business details (carried over from the existing site).
 * Update here only — they feed the header, footer, form and SEO links.
 * ------------------------------------------------------------------ */
const PHONE = "+1 (817) 678-4346";
const PHONE_DIGITS = "+18176784346";
const EMAIL = "Dispatch5services@gmail.com";
const SITE_URL = "https://americanlogistics.online";

/* Photography lives in /public/images. Swap files here, nothing else changes. */
const PHOTOS = {
  hero: {
    src: "/images/hero-dusk-1000.webp",
    srcSet: "/images/hero-dusk-640.webp 640w, /images/hero-dusk-1000.webp 1000w, /images/hero-dusk-1400.webp 1400w",
    alt: "A semi-truck and dry van trailer driving down a U.S. highway at dusk",
    width: 1000,
    height: 1500,
  },
  about: {
    src: "/images/warehouse-900.webp",
    srcSet: "/images/warehouse-600.webp 600w, /images/warehouse-900.webp 900w",
    alt: "A long aisle of palletized freight on shelving inside a distribution warehouse",
    width: 900,
    height: 1350,
  },
};

const NAV = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#why", label: "Why Choose Us" },
  { href: "#contact", label: "Contact" },
];

const EQUIPMENT = [
  { name: "26-ft Box Trucks", use: "Local and regional freight that lets you sleep at home more often.", look: "Palletized freight, furniture, appliances, retail deliveries" },
  { name: "Cargo Vans", use: "Small, time-sensitive loads where a quick turnaround matters most.", look: "Expedited and direct freight, short-notice pickups" },
  { name: "Dry Vans", use: "Enclosed trailers hauling general freight on steady lanes.", look: "Packaged goods, consumer products, non-perishable food" },
  { name: "Refrigerated Trucks", use: "Temperature-controlled freight with tight appointment windows.", look: "Produce, frozen and dairy products, check-call discipline" },
  { name: "Flatbeds", use: "Open-deck freight that needs the right setup and securement.", look: "Building materials, steel, machinery, tarp and strap loads" },
  { name: "Hotshots", use: "Fast, smaller open-deck freight that can't wait on a full-size truck.", look: "Expedited equipment, parts, partial and time-critical loads" },
];

const SERVICES = [
  { icon: Search, title: "Freight and Load Searching", copy: "We work the load boards and our broker contacts for freight that fits your equipment, your lanes and your home time, so you aren't scrolling boards between stops." },
  { icon: Handshake, title: "Rate Negotiation", copy: "A posted rate is a starting point. We negotiate with the broker and weigh the lane, the miles and the deadhead before we agree to a number." },
  { icon: Phone, title: "Broker Communication", copy: "The calls, emails and follow-ups go through us. You get the details that matter, not the back-and-forth that eats your day." },
  { icon: ClipboardCheck, title: "Load Booking and Coordination", copy: "Once you approve a load, we book it, confirm pickup and delivery windows, and sort out changes as they come up." },
  { icon: FileText, title: "Dispatch Documentation", copy: "We check rate confirmations against what was agreed and keep dispatch paperwork organized, so billing isn't a scramble later." },
  { icon: Headset, title: "Ongoing Carrier Support", copy: "A breakdown, a late appointment, detention, a load that falls through. You have someone to call when the plan changes." },
];

const WHY = [
  { title: "24/7 dispatch communication", copy: "Freight doesn't keep office hours. When something comes up on a load, you can reach us." },
  { title: "Professional broker coordination", copy: "We deal with brokers every day. We keep conversations direct, polite and on the record." },
  { title: "Rate negotiation", copy: "We negotiate for every load. We'll also tell you when a rate doesn't make sense for your truck." },
  { title: "Transparent pricing", copy: "We explain how dispatch is priced before you commit to anything. No guessing about what you owe." },
  { title: "No forced dispatch", copy: "You decide what your truck runs. We bring options and a recommendation. We don't push loads on you." },
  { title: "Carrier-focused service", copy: "We work for the carrier. Your equipment, lanes and schedule shape the freight we look for." },
  { title: "Consistent communication", copy: "You hear from us at pickup, at delivery and when something changes, without having to ask." },
];

const STEPS = [
  { icon: Truck, title: "Tell us about your truck", copy: "A short call or form. Who you are, what you drive, where your authority stands." },
  { icon: ClipboardList, title: "Share your equipment and operating requirements", copy: "Lanes, home time, rate floor, anything you won't haul. We build around it." },
  { icon: Search, title: "We search, negotiate and coordinate loads", copy: "We find freight, negotiate with brokers and bring you loads to approve." },
  { icon: MessagesSquare, title: "Stay connected with our dispatch team", copy: "We stay in touch through pickup and delivery, and we're a call away when plans change." },
];

const EQUIPMENT_OPTIONS = ["26-ft Box Truck", "Cargo Van", "Dry Van", "Refrigerated Truck", "Flatbed", "Hotshot", "Other"];

type Field = "name" | "phone" | "email";
type Errors = Partial<Record<Field, string>>;

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand ${light ? "brand-light" : ""}`} href="#top" aria-label="American Logistics, home">
      <img src="/images/logo.png" width={440} height={277} alt="American Logistics" decoding="async" />
    </a>
  );
}

function validate(data: Record<string, string>): Errors {
  const errors: Errors = {};
  if (!data.name?.trim()) errors.name = "Please enter your name.";
  if (data.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a phone number with area code.";
  if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) errors.email = "Enter a valid email address.";
  return errors;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<null | "sent" | "email">(null);
  const [sentName, setSentName] = useState("");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.website) return; // honeypot: bots fill this, people never see it

    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) {
      window.setTimeout(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 0);
      return;
    }

    const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
    if (!endpoint) {
      // No form service configured: hand the message to the visitor's email app.
      const body = [
        `Name: ${data.name}`, `Company: ${data.company || "-"}`, `Phone: ${data.phone}`, `Email: ${data.email}`,
        `MC/DOT number: ${data.mc || "-"}`, `Equipment: ${data.truckType || "-"}`, "", data.message || "",
      ].join("\n");
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Dispatch inquiry from ${data.name}`)}&body=${encodeURIComponent(body)}`;
      setResult("email");
      return;
    }

    setSending(true);
    setFormError("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const { website: _honeypot, ...fields } = data;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...fields, _subject: `New dispatch inquiry from ${data.name}`, source: SITE_URL }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setSentName(data.name.trim().split(" ")[0]);
      setResult("sent");
    } catch {
      setFormError(`We couldn't send your inquiry. Please try again, or call ${PHONE} or email ${EMAIL}.`);
    } finally {
      window.clearTimeout(timer);
      setSending(false);
    }
  };

  const fieldProps = (name: Field) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="site" id="top">
      <div className="topbar">
        <div className="wrap topbar-inner">
          <span>24/7 dispatch communication</span>
          <span className="topbar-links">
            <a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a>
            <a href={`mailto:${EMAIL}`} className="topbar-email">{EMAIL}</a>
          </span>
        </div>
      </div>

      <header className="header">
        <div className="wrap header-inner">
          <BrandMark />
          <nav className="nav" aria-label="Primary">
            {NAV.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <a className="btn btn-red btn-sm header-cta" href="#contact">Get Started</a>
          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-menu">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <div id="mobile-menu" className={`drawer ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen} role="dialog" aria-label="Menu">
        <div className="drawer-head">
          <BrandMark />
          <button className="menu-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={24} /></button>
        </div>
        <nav aria-label="Mobile">
          {NAV.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>{item.label}<ArrowRight size={18} /></a>)}
        </nav>
        <div className="drawer-foot">
          <a className="btn btn-red btn-block" href="#contact" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Get Started</a>
          <a className="btn btn-outline btn-block" href={`tel:${PHONE_DIGITS}`} tabIndex={menuOpen ? 0 : -1}><Phone size={17} /> {PHONE}</a>
        </div>
      </div>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Freight dispatch for U.S. carriers</p>
              <h1><span>Your Trucks.</span> <span>Your Business.</span> <em>Our Dispatch Support.</em></h1>
              <p className="lede">Finding the right loads takes time. We help carriers navigate the freight market, negotiate with brokers, and coordinate their loads so they can focus on keeping their trucks moving.</p>
              <div className="hero-actions">
                <a className="btn btn-red" href="#contact">Let's Get Started <ArrowRight size={17} /></a>
                <a className="btn btn-outline" href="#services">Explore Our Services</a>
              </div>
              <ul className="hero-points" aria-label="Highlights">
                <li>24/7 dispatch communication</li>
                <li>No forced dispatch</li>
                <li>Transparent pricing</li>
              </ul>
            </div>
            <figure className="hero-photo">
              <img src={PHOTOS.hero.src} srcSet={PHOTOS.hero.srcSet} sizes="(min-width: 960px) 46vw, 100vw" width={PHOTOS.hero.width} height={PHOTOS.hero.height} alt={PHOTOS.hero.alt} fetchPriority="high" decoding="async" />
              <figcaption>Box trucks, cargo vans, dry vans, refrigerated trucks, flatbeds and hotshots.</figcaption>
            </figure>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="section section-white" aria-labelledby="intro-title">
          <div className="wrap intro-grid">
            <div>
              <p className="eyebrow">What we do</p>
              <h2 id="intro-title">Dispatch for carriers who’d rather run freight than chase it.</h2>
            </div>
            <div className="intro-body">
              <p>American Logistics is a dispatching service for owner-operators, small fleets and motor carriers working in the United States. You tell us what you run and where you want to go. We find the loads, negotiate the rate with the broker and book the freight you approve.</p>
              <dl className="intro-facts">
                <div><dt>Who we help</dt><dd>Owner-operators, small trucking companies and motor carriers</dd></div>
                <div><dt>What we handle</dt><dd>Load search, rates, broker calls, booking and dispatch paperwork</dd></div>
                <div><dt>How it works</dt><dd>You approve every load. We stay in touch until it's delivered.</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* EQUIPMENT */}
        <section className="section section-off" id="equipment" aria-labelledby="equip-title">
          <div className="wrap equip-grid">
            <div className="equip-head">
              <p className="eyebrow">Equipment we support</p>
              <h2 id="equip-title">If it hauls freight, we can talk about dispatching it.</h2>
              <p className="muted">Different equipment means different freight, different rates and a different day. We learn how you run before we start looking.</p>
              <a className="link-arrow" href="#contact">Tell us what you drive <ArrowRight size={16} /></a>
            </div>
            <ol className="equip-list">
              {EQUIPMENT.map((item, i) => (
                <li key={item.name}>
                  <span className="equip-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.use}</p>
                    <p className="equip-look"><span>Typical freight</span>{item.look}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section section-white" id="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Our dispatch services</p>
              <h2 id="services-title">The work between “I need a load” and “I got paid.”</h2>
            </div>
            <div className="services-grid">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <article key={s.title}>
                    <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
                    <h3>{s.title}</h3>
                    <p>{s.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="section section-navy" id="why" aria-labelledby="why-title">
          <div className="wrap why-grid">
            <div className="why-head">
              <p className="eyebrow eyebrow-light">Why American Logistics</p>
              <h2 id="why-title">More Than Finding Loads. We Help Keep Your Business Moving.</h2>
              <p>We don't promise freight, revenue or profit. We promise to do the dispatching work carefully and to keep you informed while we do it.</p>
            </div>
            <ol className="why-list">
              {WHY.map((w, i) => (
                <li key={w.title}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div><h3>{w.title}</h3><p>{w.copy}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section section-off" id="how" aria-labelledby="how-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title">Four steps from first call to loaded truck.</h2>
            </div>
            <ol className="steps">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={s.title}>
                    <div className="step-mark"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></div>
                    <span className="step-label">Step {i + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.copy}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section section-white" id="about" aria-labelledby="about-title">
          <div className="wrap about-grid">
            <figure className="about-photo">
              <img src={PHOTOS.about.src} srcSet={PHOTOS.about.srcSet} sizes="(min-width: 960px) 40vw, 100vw" width={PHOTOS.about.width} height={PHOTOS.about.height} alt={PHOTOS.about.alt} loading="lazy" decoding="async" />
            </figure>
            <div className="about-copy">
              <p className="eyebrow">About us</p>
              <h2 id="about-title">A dispatch desk that knows how the day actually goes.</h2>
              <p>Anyone who has run a truck knows the kind of day we mean. The broker who doesn't call back. The rate that looks fine until you count the deadhead. The receiver that holds you for three hours.</p>
              <p>American Logistics was built around those days. We handle the phone, the negotiating and the paperwork so you can handle the driving and the business.</p>
              <p>We'd rather tell you a load doesn't make sense than book it just to fill a slot. We'd rather answer the phone than send a text saying we'll call you back. That's the whole idea.</p>
              <p className="about-sign">We work with trucking companies and independent owner-operators across the United States.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="cta" aria-labelledby="cta-title">
          <div className="wrap cta-inner">
            <div>
              <h2 id="cta-title">Ready to Put Your Truck to Work?</h2>
              <p>Let's talk about your equipment, your lanes, and the kind of freight you're looking for. Our team is ready to hear from you.</p>
            </div>
            <a className="btn btn-red btn-lg" href="#contact">Talk to Our Team <ArrowRight size={18} /></a>
          </div>
        </section>

        {/* CONTACT */}
        <section className="section section-off" id="contact" aria-labelledby="contact-title">
          <div className="wrap contact-grid">
            <div className="contact-info">
              <p className="eyebrow">Contact</p>
              <h2 id="contact-title">Tell us about your truck.</h2>
              <p className="muted">Send the form, or call us. Either way, you'll get a real person and a clear next step, not a sales script.</p>
              <ul className="contact-list">
                <li><Phone size={20} aria-hidden="true" /><div><small>Call</small><a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a></div></li>
                <li><Mail size={20} aria-hidden="true" /><div><small>Email</small><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div></li>
                <li><Clock3 size={20} aria-hidden="true" /><div><small>Dispatch communication</small><span>24/7</span></div></li>
              </ul>
              <div className="need">
                <h3>To get you started, we usually ask for</h3>
                <ul>
                  <li>MC and DOT numbers</li>
                  <li>Certificate of insurance</li>
                  <li>W-9</li>
                  <li>Your equipment details and preferred lanes</li>
                </ul>
                <p>You don't need all of this to reach out. We'll walk you through it.</p>
              </div>
            </div>

            <div className="form-card">
              {result ? (
                <div className="form-done" role="status">
                  <CircleCheck className="done-icon" size={56} strokeWidth={1.5} aria-hidden="true" />
                  <h3>{result === "sent" ? `Thanks${sentName ? `, ${sentName}` : ""}. We've got your inquiry.` : "Almost there."}</h3>
                  {result === "sent" ? (
                    <>
                      <p>Your details are with our dispatch team. We'll contact you by phone or email about your equipment and lanes.</p>
                      <ol className="done-steps">
                        <li>We review your inquiry.</li>
                        <li>We reach out to talk about your truck and the freight you want.</li>
                        <li>If it's a fit, we start looking for loads.</li>
                      </ol>
                      <p className="done-urgent">Need us sooner? Call <a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a>.</p>
                    </>
                  ) : (
                    <p>Your email app should have opened with your message ready to send. If it didn't, email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call <a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a>.</p>
                  )}
                  <button className="btn btn-outline" onClick={() => setResult(null)}>Send another inquiry</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3>Request dispatch support</h3>
                  <div className="row">
                    <label><span>Full name <b className="req" aria-hidden="true">*</b></span>
                      <input name="name" autoComplete="name" {...fieldProps("name")} />
                      {errors.name && <small className="err" id="name-error">{errors.name}</small>}
                    </label>
                    <label><span>Company name</span>
                      <input name="company" autoComplete="organization" />
                    </label>
                  </div>
                  <div className="row">
                    <label><span>Phone number <b className="req" aria-hidden="true">*</b></span>
                      <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(555) 555-5555" {...fieldProps("phone")} />
                      {errors.phone && <small className="err" id="phone-error">{errors.phone}</small>}
                    </label>
                    <label><span>Email address <b className="req" aria-hidden="true">*</b></span>
                      <input name="email" type="email" inputMode="email" autoComplete="email" {...fieldProps("email")} />
                      {errors.email && <small className="err" id="email-error">{errors.email}</small>}
                    </label>
                  </div>
                  <div className="row">
                    <label><span>MC/DOT number</span>
                      <input name="mc" placeholder="Optional" />
                    </label>
                    <label><span>Equipment type</span>
                      <select name="truckType" defaultValue="">
                        <option value="">Select equipment</option>
                        {EQUIPMENT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </label>
                  </div>
                  <label><span>Message</span>
                    <textarea name="message" rows={4} placeholder="Your lanes, home time, or what you want from a dispatcher." />
                  </label>
                  <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  {formError && <p className="form-error" role="alert">{formError}</p>}
                  <button className="btn btn-red btn-block" type="submit" disabled={sending} aria-busy={sending}>{sending ? <><LoaderCircle className="spin" size={19} aria-hidden="true" /> Sending your inquiry…</> : <>Send Inquiry <ArrowRight size={17} /></>}</button>
                  {sending && <p className="sending-note" role="status">Please keep this page open. This only takes a few seconds.</p>}
                  <p className="privacy"><strong>Privacy.</strong> We use the details you send only to respond to your inquiry about dispatch support. Fields marked * are required.</p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <BrandMark light />
            <p>Freight dispatching and carrier support for trucking companies and owner-operators in the United States.</p>
          </div>
          <nav aria-label="Footer">
            <h4>Company</h4>
            {NAV.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div>
            <h4>Services</h4>
            {SERVICES.map((s) => <a key={s.title} href="#services">{s.title}</a>)}
          </div>
          <div>
            <h4>Contact</h4>
            <a href={`tel:${PHONE_DIGITS}`}>{PHONE}</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <span>24/7 dispatch communication</span>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} American Logistics. All rights reserved.</span>
          <a href="#top">Back to top</a>
        </div>
      </footer>

      <div className="mobile-bar" role="region" aria-label="Quick contact">
        <a href={`tel:${PHONE_DIGITS}`} className="mb-call"><Phone size={18} /> Call Now</a>
        <a href="#contact" className="mb-quote">Get Started</a>
      </div>
    </div>
  );
}

export default Home;
