import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logomark } from "../components/Navbar";
import AuthShell from "../components/AuthShell";

const departments = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Other"];

const interestsList = [
  "Web Development",
  "DSA",
  "AI / ML",
  "Fitness",
  "Gaming",
  "Startups",
  "Design",
];

const STEPS = [
  { num: "01", title: "Department & year", desc: "Where you study, and how far along you are." },
  { num: "02", title: "Interests", desc: "What you're curious about — pick what fits." },
  { num: "03", title: "Skills you can share", desc: "What you can help others with." },
  { num: "04", title: "About you", desc: "A short bio + your links." },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    department: "",
    year: "",
    interests: [],
    skillsCanHelp: [],
    topicsNeedHelp: "",
    bio: "",
    github: "",
    linkedin: "",
  });

  const toggleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async () => {
    if (!token || saving) return;
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      navigate("/");
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const progressPct = (step / STEPS.length) * 100;

  return (
    <AuthShell sidebar={<OnboardingSidebar step={step} />}>
      <Link
        to="/"
        className="lg:hidden flex items-center gap-2 justify-center mb-8"
      >
        <Logomark />
        <span
          className="font-semibold"
          style={{ fontSize: 17, letterSpacing: "-0.02em" }}
        >
          UniConnect
        </span>
      </Link>

      {/* Mobile progress + step label */}
      <div className="lg:hidden mb-8">
        <div
          className="flex justify-between text-xs mb-2"
          style={{ color: "var(--pl-ink-3)" }}
        >
          <span>
            Step {step} of {STEPS.length}
          </span>
          <span
            className="tabular-nums font-semibold"
            style={{ color: "var(--pl-ink)" }}
          >
            {Math.round(progressPct)}%
          </span>
        </div>
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: "var(--pl-line)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progressPct}%`, background: "var(--pl-accent)" }}
          />
        </div>
      </div>

      <div className="mb-8">
        <p
          className="text-xs font-mono uppercase tracking-wider mb-2"
          style={{ color: "var(--pl-ink-3)" }}
        >
          Step {step} / {STEPS.length}
        </p>
        <h1
          className="pl-display"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)" }}
        >
          {STEPS[step - 1].title}.
        </h1>
        <p
          className="mt-2 text-base"
          style={{ color: "var(--pl-ink-2)" }}
        >
          {STEPS[step - 1].desc}
        </p>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <SelectField
            label="Department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          >
            <option value="">Choose a department</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </SelectField>
          <SelectField
            label="Year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          >
            <option value="">Choose a year</option>
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </SelectField>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <p
            className="text-xs font-medium mb-3"
            style={{ color: "var(--pl-ink-2)" }}
          >
            Pick the ones that match
          </p>
          <ChipGrid
            items={interestsList}
            selected={formData.interests}
            onToggle={(v) => toggleSelect("interests", v)}
          />
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <p
            className="text-xs font-medium mb-3"
            style={{ color: "var(--pl-ink-2)" }}
          >
            Skills you can help with
          </p>
          <ChipGrid
            items={interestsList}
            selected={formData.skillsCanHelp}
            onToggle={(v) => toggleSelect("skillsCanHelp", v)}
          />
          <div className="mt-6">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--pl-ink-2)" }}
            >
              Topics you need help in
            </label>
            <Input
              type="text"
              placeholder="e.g. React hooks, Graphs, SQL"
              value={formData.topicsNeedHelp}
              onChange={(e) =>
                setFormData({ ...formData, topicsNeedHelp: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--pl-ink-2)" }}
            >
              Short bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell people what you're into in a sentence."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white text-sm outline-none transition resize-none"
              style={{
                color: "var(--pl-ink)",
                boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--pl-ink-2)" }}
            >
              GitHub
            </label>
            <Input
              type="url"
              placeholder="https://github.com/you"
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--pl-ink-2)" }}
            >
              LinkedIn
            </label>
            <Input
              type="url"
              placeholder="https://linkedin.com/in/you"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div
        className="flex items-center justify-between mt-10 pt-6"
        style={{ borderTop: "1px solid var(--pl-line)" }}
      >
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="pl-btn-ghost"
            style={{ paddingLeft: "0.5rem" }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length ? (
          <button
            onClick={() => setStep(step + 1)}
            className="pl-btn"
            style={{ padding: "0.75rem 1.25rem", fontSize: 14 }}
          >
            Continue
            <span className="arrow">→</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!token || saving}
            className="pl-btn"
            style={{ padding: "0.75rem 1.25rem", fontSize: 14 }}
          >
            {saving ? (
              <>
                <span
                  className="h-3.5 w-3.5 rounded-full animate-spin"
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                Finish
                <span className="arrow">→</span>
              </>
            )}
          </button>
        )}
      </div>
    </AuthShell>
  );
};

/* ───────── Sidebar with live step tracker ───────── */
const OnboardingSidebar = ({ step }) => {
  const progressPct = (step / STEPS.length) * 100;
  return (
    <div className="flex flex-col h-full justify-between gap-10 pl-reveal">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logomark />
          <span
            className="font-semibold tracking-tight"
            style={{ fontSize: 17, color: "white", letterSpacing: "-0.02em" }}
          >
            UniConnect
          </span>
        </Link>
        <span
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {Math.round(progressPct)}% complete
        </span>
      </div>

      <div className="max-w-md">
        <span className="auth-side-eyebrow">
          <span className="dot" />
          Setting up your profile
        </span>
        <h1
          className="pl-display mt-6"
          style={{
            fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
            color: "white",
            lineHeight: 1.05,
          }}
        >
          A profile worth{" "}
          <span style={{ color: "var(--pl-accent)" }}>showing.</span>
        </h1>
        <p
          className="mt-5 text-base leading-relaxed"
          style={{ color: "rgba(255,255,255,0.7)", maxWidth: 420 }}
        >
          Four short steps — under a minute. The more you share, the better
          your matches get.
        </p>

        <div className="mt-10">
          {/* Progress bar */}
          <div
            className="h-1 rounded-full overflow-hidden mb-6"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${progressPct}%`,
                background: "var(--pl-accent)",
                boxShadow: "0 0 14px rgba(255,90,31,0.4)",
              }}
            />
          </div>

          {/* Step list */}
          <ol>
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === step;
              const isDone = stepNum < step;
              return (
                <li
                  key={s.num}
                  className={`auth-side-step${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
                >
                  <span className="num">
                    {isDone ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </span>
                  <span className="text-sm font-medium">{s.title}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        <span>© 2026 UniConnect</span>
        <span className="inline-flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--pl-accent)",
              boxShadow: "0 0 0 3px rgba(255,90,31,0.2)",
            }}
          />
          One-time setup
        </span>
      </div>
    </div>
  );
};

/* ───────── Form atoms ───────── */
const Input = (props) => (
  <input
    {...props}
    className="w-full px-4 py-3 rounded-xl bg-white text-sm outline-none transition"
    style={{
      color: "var(--pl-ink)",
      boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
    }}
  />
);

const SelectField = ({ label, children, ...selectProps }) => (
  <div>
    <label
      className="block text-xs font-medium mb-1.5"
      style={{ color: "var(--pl-ink-2)" }}
    >
      {label}
    </label>
    <select
      {...selectProps}
      className="w-full px-4 py-3 rounded-xl bg-white text-sm outline-none transition appearance-none"
      style={{
        color: "var(--pl-ink)",
        boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1l4 4 4-4' stroke='%23737373' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "36px",
      }}
    >
      {children}
    </select>
  </div>
);

const ChipGrid = ({ items, selected, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => {
      const isSelected = selected.includes(item);
      return (
        <button
          key={item}
          type="button"
          onClick={() => onToggle(item)}
          className="px-3.5 py-2 rounded-full text-sm font-medium transition"
          style={
            isSelected
              ? {
                  background: "var(--pl-ink)",
                  color: "white",
                  boxShadow: "inset 0 0 0 1px var(--pl-ink)",
                }
              : {
                  background: "white",
                  color: "var(--pl-ink-2)",
                  boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
                }
          }
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.boxShadow =
                "inset 0 0 0 1px var(--pl-ink)";
              e.currentTarget.style.color = "var(--pl-ink)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.boxShadow =
                "inset 0 0 0 1px var(--pl-line-2)";
              e.currentTarget.style.color = "var(--pl-ink-2)";
            }
          }}
        >
          {item}
        </button>
      );
    })}
  </div>
);

export default Onboarding;
