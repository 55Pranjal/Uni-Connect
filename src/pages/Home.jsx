import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SharedNavbar from "../components/Navbar";
import SharedFooter from "../components/Footer";

/* ════════════════════════════════════════════════════════════════════════
   PRODUCT LANDING — white + warm orange accent
════════════════════════════════════════════════════════════════════════ */

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="pl-page min-h-screen" style={{ background: "var(--pl-bg)" }}>
      <SharedNavbar />
      <Hero isAuthenticated={isAuthenticated} />
      <Logos />
      <Features />
      <HowItWorks />
      <Showcase />
      <Testimonial />
      <FinalCTA isAuthenticated={isAuthenticated} />
      <SharedFooter />
    </div>
  );
};

/* ─────────────── HERO ─────────────── */
const Hero = ({ isAuthenticated }) => (
  <section className="relative overflow-hidden">
    <div className="pl-soft-glow" />
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28 relative">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left — copy */}
        <div className="lg:col-span-6 pl-reveal">
          <span className="pl-eyebrow">
            <span className="dot" />
            New · Made for students
          </span>
          <h1
            className="pl-display mt-6"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
          >
            The campus app
            <br />
            that{" "}
            <span style={{ color: "var(--pl-accent)" }}>actually</span> gets
            used.
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed max-w-lg"
            style={{ color: "var(--pl-ink-2)" }}
          >
            Find classmates by skill, gather in real communities, and ship
            projects with people you trust — all in one place, with none of
            the algorithmic noise.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to={isAuthenticated ? "/discover" : "/signup"}
              className="pl-btn"
            >
              {isAuthenticated ? "Open app" : "Get started — free"}
              <span className="arrow">→</span>
            </Link>
            <a href="#how" className="pl-btn-secondary">
              See how it works
            </a>
          </div>

          <div
            className="mt-10 flex items-center gap-4 text-sm"
            style={{ color: "var(--pl-ink-3)" }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white"
                  style={{
                    background: ["#fed7aa", "#fde68a", "#bbf7d0", "#bae6fd"][
                      i - 1
                    ],
                  }}
                />
              ))}
            </div>
            <span>
              <span style={{ color: "var(--pl-ink)" }} className="font-medium">
                10,000+
              </span>{" "}
              students at 50+ universities
            </span>
          </div>
        </div>

        {/* Right — product visual */}
        <div className="lg:col-span-6 relative h-[420px] sm:h-[500px] pl-reveal" style={{ animationDelay: "120ms" }}>
          <HeroVisual />
        </div>
      </div>
    </div>
  </section>
);

const HeroVisual = () => (
  <div className="relative h-full w-full">
    {/* Grid backdrop */}
    <div
      className="absolute inset-0 rounded-3xl pl-grid-bg"
      style={{
        background:
          "linear-gradient(180deg, rgba(250,250,249,0.6), rgba(255,255,255,0))",
      }}
    />

    {/* Floating profile card */}
    <div
      className="pl-card pl-float absolute"
      style={{
        top: "8%",
        left: "6%",
        width: "62%",
        "--r": "-2.5deg",
        boxShadow: "0 30px 60px -25px rgba(10,10,10,0.18)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-11 h-11 rounded-full"
          style={{ background: "linear-gradient(135deg, #fed7aa, #ff5a1f)" }}
        />
        <div className="flex-1">
          <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
            Priya Mehta
          </p>
          <p style={{ fontSize: 12, color: "var(--pl-ink-3)" }}>
            CSE · Year 3
          </p>
        </div>
        <span
          className="text-xs font-medium"
          style={{
            color: "var(--pl-accent-hover)",
            background: "var(--pl-accent-soft)",
            padding: "3px 8px",
            borderRadius: 999,
          }}
        >
          Lv 6
        </span>
      </div>
      <div className="space-y-2">
        {[
          { name: "React", lv: 7 },
          { name: "Figma", lv: 5 },
          { name: "Prisma", lv: 4 },
        ].map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between text-sm"
          >
            <span style={{ color: "var(--pl-ink-2)" }}>{s.name}</span>
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: 80,
                  background: "var(--pl-line)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(s.lv / 10) * 100}%`,
                    background: "var(--pl-ink)",
                  }}
                />
              </div>
              <span
                className="text-xs tabular-nums"
                style={{ color: "var(--pl-ink-3)", width: 14 }}
              >
                {s.lv}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button
        className="pl-btn mt-5 w-full justify-center"
        style={{ padding: "0.6rem 1rem", fontSize: 14 }}
      >
        Connect
        <span className="arrow">→</span>
      </button>
    </div>

    {/* Floating chat bubble */}
    <div
      className="pl-card pl-float absolute"
      style={{
        bottom: "10%",
        right: "4%",
        width: "55%",
        "--r": "3deg",
        animationDelay: "1.5s",
        padding: "1rem 1.1rem",
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="w-8 h-8 rounded-full shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, #bae6fd, #38bdf8)" }}
        />
        <div className="flex-1">
          <p style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>
            Marcus Chen
            <span
              className="ml-2 font-normal"
              style={{ color: "var(--pl-ink-4)", fontSize: 11 }}
            >
              · 2m
            </span>
          </p>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--pl-ink-2)",
              marginTop: 4,
              lineHeight: 1.45,
            }}
          >
            Hey! Saw your React skill — wanna jam on the hackathon idea
            tomorrow?
          </p>
        </div>
      </div>
    </div>

    {/* Notification chip */}
    <div
      className="pl-card pl-float absolute flex items-center gap-2.5"
      style={{
        top: "45%",
        right: "8%",
        width: "auto",
        "--r": "-4deg",
        animationDelay: "0.7s",
        padding: "0.65rem 1rem",
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: "var(--pl-accent)" }}
      />
      <span style={{ fontSize: 13, fontWeight: 500 }}>
        3 new connection requests
      </span>
    </div>
  </div>
);

/* ─────────────── LOGOS / TRUST STRIP ─────────────── */
const Logos = () => (
  <section className="border-y" style={{ borderColor: "var(--pl-line)" }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center gap-6">
      <p
        className="text-sm shrink-0"
        style={{ color: "var(--pl-ink-3)" }}
      >
        Trusted at universities like
      </p>
      <div
        className="flex flex-wrap items-center justify-center sm:justify-start gap-x-10 gap-y-3 flex-1"
        style={{ color: "var(--pl-ink-4)" }}
      >
        {["KIIT", "Stanford", "IIT-D", "MIT", "BITS Pilani", "NUS"].map(
          (u) => (
            <span
              key={u}
              className="font-semibold tracking-tight"
              style={{ fontSize: 17, opacity: 0.6 }}
            >
              {u}
            </span>
          ),
        )}
      </div>
    </div>
  </section>
);

/* ─────────────── FEATURES ─────────────── */
const Features = () => {
  const items = [
    {
      icon: <IconUsers />,
      title: "Discover students",
      desc: "Search by skill, year, branch, or interest. Send a connection — start a DM in one tap.",
    },
    {
      icon: <IconChats />,
      title: "Real communities",
      desc: "Course groups, clubs, hackathon channels. Members, mods, and signal — without the noise.",
    },
    {
      icon: <IconRocket />,
      title: "Ship projects together",
      desc: "Post an idea, accept collaborators, open a project room. Build something real with people you trust.",
    },
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-2xl mb-14 sm:mb-16 pl-reveal">
        <span className="pl-eyebrow">
          <span className="dot" />
          What it does
        </span>
        <h2
          className="pl-display mt-5"
          style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
        >
          Everything your campus chat
          <br />
          group <span style={{ color: "var(--pl-accent)" }}>should be</span>.
        </h2>
        <p
          className="text-lg mt-5"
          style={{ color: "var(--pl-ink-2)" }}
        >
          Three simple primitives — students, communities, and projects — that
          plug into the rhythm of campus life.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
        {items.map((it, i) => (
          <div
            key={it.title}
            className="pl-card pl-card-hover pl-reveal"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="inline-flex w-11 h-11 items-center justify-center rounded-xl mb-5"
              style={{
                background: "var(--pl-accent-soft)",
                color: "var(--pl-accent-hover)",
              }}
            >
              {it.icon}
            </div>
            <h3
              className="text-xl font-semibold"
              style={{ letterSpacing: "-0.02em" }}
            >
              {it.title}
            </h3>
            <p
              className="mt-2 text-base leading-relaxed"
              style={{ color: "var(--pl-ink-2)" }}
            >
              {it.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-4m-4 6H2v-2a4 4 0 015-4m4 0a4 4 0 100-8 4 4 0 010 8zm6-8a3 3 0 11-6 0 3 3 0 016 0zM7 8a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconChats = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h8m5-5a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconRocket = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

/* ─────────────── HOW IT WORKS ─────────────── */
const HowItWorks = () => (
  <section
    id="how"
    className="relative"
    style={{ background: "var(--pl-surface)" }}
  >
    <div
      className="absolute inset-x-0 top-0 h-px"
      style={{ background: "var(--pl-line)" }}
    />
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-2xl mb-14 pl-reveal">
        <span className="pl-eyebrow">
          <span className="dot" />
          How it works
        </span>
        <h2
          className="pl-display mt-5"
          style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
        >
          Three steps, ninety seconds.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        {[
          {
            step: "01",
            title: "Make your card",
            desc: "Pick a name, drop your branch, and choose the three skills people should see at a glance.",
          },
          {
            step: "02",
            title: "Find your circle",
            desc: "Search for the people who match your year, your interests, or that one course you're stuck on.",
          },
          {
            step: "03",
            title: "Build something together",
            desc: "Open a DM, join a community, or post a project. Skill chips level up as you collaborate.",
          },
        ].map((s, i) => (
          <div
            key={s.step}
            className="pl-reveal"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span
                className="text-sm font-mono font-medium tabular-nums px-2.5 py-0.5 rounded-md"
                style={{
                  background: "var(--pl-bg)",
                  color: "var(--pl-ink-3)",
                  boxShadow: "inset 0 0 0 1px var(--pl-line)",
                  letterSpacing: "0.04em",
                }}
              >
                {s.step}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--pl-line)" }}
              />
            </div>
            <h3
              className="text-2xl font-semibold"
              style={{ letterSpacing: "-0.025em" }}
            >
              {s.title}
            </h3>
            <p
              className="mt-2 leading-relaxed"
              style={{ color: "var(--pl-ink-2)" }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────── SHOWCASE (split feature) ─────────────── */
const Showcase = () => (
  <section
    id="showcase"
    className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28"
  >
    <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
      <div className="pl-reveal order-2 lg:order-1">
        <div
          className="pl-card relative overflow-hidden p-0"
          style={{ aspectRatio: "5 / 4" }}
        >
          {/* Fake project room mock */}
          <div
            className="absolute inset-0 p-5 flex flex-col"
            style={{ background: "var(--pl-surface)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pl-accent), #ff8a5b)",
                  }}
                />
                <p
                  className="font-semibold text-sm"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  Hackday — Quiet Hours app
                </p>
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: "var(--pl-accent-hover)",
                  background: "var(--pl-accent-soft)",
                }}
              >
                ● Open
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-hidden">
              {[
                { who: "Priya", text: "Pushed the Figma file — checking on it now", color: "#fed7aa" },
                { who: "Marcus", text: "Wired up auth. Adding the connection flow next.", color: "#bae6fd" },
                { who: "You", text: "Going to take the onboarding screens", color: "#bbf7d0", self: true },
                { who: "Ana", text: "I'll handle copy + landing once flows are in", color: "#fbcfe8" },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${m.self ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className="w-7 h-7 rounded-full shrink-0"
                    style={{ background: m.color }}
                  />
                  <div
                    className="rounded-2xl px-3 py-2 max-w-[78%]"
                    style={{
                      background: m.self ? "var(--pl-ink)" : "var(--pl-bg)",
                      color: m.self ? "white" : "var(--pl-ink)",
                      fontSize: 13,
                      lineHeight: 1.4,
                      boxShadow: m.self
                        ? "none"
                        : "inset 0 0 0 1px var(--pl-line)",
                    }}
                  >
                    {!m.self && (
                      <p
                        className="font-semibold mb-0.5"
                        style={{ fontSize: 11, color: "var(--pl-ink-3)" }}
                      >
                        {m.who}
                      </p>
                    )}
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-3 rounded-xl flex items-center gap-2 px-3 py-2"
              style={{
                background: "var(--pl-bg)",
                boxShadow: "inset 0 0 0 1px var(--pl-line)",
              }}
            >
              <span
                className="text-sm flex-1"
                style={{ color: "var(--pl-ink-4)" }}
              >
                Reply to #quiet-hours
              </span>
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
                style={{ background: "var(--pl-accent)" }}
              >
                ↑
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pl-reveal order-1 lg:order-2">
        <span className="pl-eyebrow">
          <span className="dot" />
          Project rooms
        </span>
        <h2
          className="pl-display mt-5"
          style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
        >
          A team. A room.
          <br />
          <span style={{ color: "var(--pl-accent)" }}>One place</span> to ship.
        </h2>
        <p
          className="text-lg mt-5 leading-relaxed"
          style={{ color: "var(--pl-ink-2)" }}
        >
          When you accept a collaborator, UniConnect spins up a private chat
          room for your project — pinned to GitHub, the live demo, the
          repo. Less scattered chaos, more shipped work.
        </p>

        <ul className="mt-7 space-y-3">
          {[
            "Private channel created automatically on first collab",
            "Roles, repo, live link — pinned to the room",
            "Quick handoff to community channels when you launch",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-3 text-base"
              style={{ color: "var(--pl-ink-2)" }}
            >
              <span
                className="mt-1 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                style={{ background: "var(--pl-accent-soft)" }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "var(--pl-accent)",
                    borderRadius: "50%",
                  }}
                />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

/* ─────────────── TESTIMONIAL ─────────────── */
const Testimonial = () => (
  <section
    id="students"
    className="relative"
    style={{ background: "var(--pl-ink)", color: "white" }}
  >
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <div className="pl-reveal">
        <span
          className="pl-eyebrow"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "var(--pl-accent)",
          }}
        >
          <span
            className="dot"
            style={{ background: "var(--pl-accent)" }}
          />
          Heard around
        </span>
        <blockquote
          className="pl-display mt-8"
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            color: "white",
            lineHeight: 1.2,
          }}
        >
          "Found{" "}
          <span style={{ color: "var(--pl-accent)" }}>
            three teammates
          </span>{" "}
          for my hackathon in 48 hours. UniConnect did more for me in a
          weekend than the campus group chat did in a semester."
        </blockquote>
        <footer className="mt-8 flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full"
            style={{
              background: "linear-gradient(135deg, #fed7aa, #ff5a1f)",
            }}
          />
          <div>
            <p className="font-semibold">Riya Sharma</p>
            <p
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              CSE '27 · KIIT University
            </p>
          </div>
        </footer>
      </div>
    </div>
  </section>
);

/* ─────────────── FINAL CTA ─────────────── */
const FinalCTA = ({ isAuthenticated }) => (
  <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
    <div
      className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
      style={{
        background: "var(--pl-accent-soft)",
        boxShadow: "inset 0 0 0 1px rgba(255, 90, 31, 0.25)",
      }}
    >
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 90, 31, 0.35), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 90, 31, 0.25), transparent 70%)",
        }}
      />

      <div className="pl-reveal relative">
        <h2
          className="pl-display"
          style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
        >
          Ready to find your people?
        </h2>
        <p
          className="mt-5 text-lg max-w-xl mx-auto"
          style={{ color: "var(--pl-ink-2)" }}
        >
          Free, forever for students. No ads, no algorithm — just the people
          you actually want to talk to.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to={isAuthenticated ? "/discover" : "/signup"}
            className="pl-btn"
            style={{ padding: "0.85rem 1.5rem", fontSize: 16 }}
          >
            {isAuthenticated ? "Open app" : "Create your free account"}
            <span className="arrow">→</span>
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="pl-btn-secondary"
              style={{ padding: "0.85rem 1.5rem", fontSize: 16 }}
            >
              I already have one
            </Link>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default Home;
