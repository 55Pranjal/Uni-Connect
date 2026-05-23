import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/cards/SkillCard";

import { getAvatarUrl } from "../utils/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TierBadge from "../components/TierBadge";
import { Skeleton } from "../components/Skeleton";
import useFocusTrap from "../hooks/useFocusTrap";
import api from "../api/api";
import EnablePushPrompt from "../components/EnablePushPrompt";

const ProfilePage = () => {
  // ✅ Correct hook usage — only at top level
  const { logout } = useAuth();

  const [showCardModal, setShowCardModal] = useState(false);
  const [showProfileSkillsModal, setShowProfileSkillsModal] = useState(false);
  const [showEditAboutModal, setShowEditAboutModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);

  // Focus traps for the two inline modals (the reusable SkillSelectModal at
  // the bottom of this file installs its own). Hook is enabled only while the
  // matching `show*` flag is true, so the ref doesn't fight with the unmounted
  // case where `.current` is null.
  const aboutModalRef = useRef(null);
  const infoModalRef = useRef(null);
  useFocusTrap(
    aboutModalRef,
    () => setShowEditAboutModal(false),
    showEditAboutModal
  );
  useFocusTrap(
    infoModalRef,
    () => setShowEditInfoModal(false),
    showEditInfoModal
  );

  const [user, setUser] = useState(null);
  const [cardSkills, setCardSkills] = useState([]);
  const [profileSkills, setProfileSkills] = useState([]);

  const [aboutForm, setAboutForm] = useState({
    bio: "",
    github: "",
    linkedin: "",
  });

  const [infoForm, setInfoForm] = useState({
    name: "",
    department: "",
    year: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/user/me");

        setUser(data.user);

        setAboutForm({
          bio: data.user.bio || "",
          github: data.user.github || "",
          linkedin: data.user.linkedin || "",
        });

        if (data.user.cardSkills?.length === 3) {
          setCardSkills(
            data.user.skills.filter((s) =>
              data.user.cardSkills.includes(s.name)
            )
          );
        } else {
          setCardSkills(data.user.skills?.slice(0, 3) || []);
        }

        if (data.user.profileSkills?.length === 4) {
          setProfileSkills(
            data.user.skills.filter((s) =>
              data.user.profileSkills.includes(s.name)
            )
          );
        } else {
          setProfileSkills(data.user.skills?.slice(0, 4) || []);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /* ================= SAVE ABOUT ================= */
  const saveAbout = async () => {
    try {
      await api.patch("/user/profile", aboutForm);
      setUser((prev) => ({ ...prev, ...aboutForm }));
      setShowEditAboutModal(false);
    } catch (err) {
      console.error("About update failed:", err);
    }
  };

  /* ================= SAVE INFO ================= */
  const saveInfo = async () => {
    try {
      await api.patch("/user/profile", infoForm);
      setUser((prev) => ({ ...prev, ...infoForm }));
      setShowEditInfoModal(false);
    } catch (err) {
      console.error("Info update failed:", err);
    }
  };

  /* ================= SAVE CARD SKILLS ================= */
  const saveCardSkills = async () => {
    await api.patch("/user/card-skills", {
      cardSkills: cardSkills.map((s) => s.name),
    });

    setShowCardModal(false);
  };

  /* ================= SAVE PROFILE SKILLS ================= */
  const saveProfileSkills = async () => {
    const existingSkillNames = user.skills.map((s) => s.name);
    const newSkills = profileSkills
      .map((s) => s.name)
      .filter((name) => !existingSkillNames.includes(name));

    if (newSkills.length > 0) {
      await api.patch("/user/profile", { skillsCanHelp: newSkills });
    }

    await api.patch("/user/profile-skills", {
      profileSkills: profileSkills.map((s) => s.name),
    });

    setUser((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        ...newSkills.map((name) => ({ name, level: 0 })),
      ],
      profileSkills: profileSkills.map((s) => s.name),
    }));

    setShowProfileSkillsModal(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-10 pl-page">
          {/* Avatar + name lines */}
          <section className="pt-4">
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </section>

          {/* Three-card skill row */}
          <section className="grid sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navbar />
        <div
          className="min-h-[60vh] flex items-center justify-center"
          style={{ color: "#dc2626" }}
        >
          {error || "Something went wrong"}
        </div>
        <Footer />
      </>
    );
  }

  const handleLogout = async () => {
    // Must await — logout() POSTs /api/auth/logout and waits for the server's
    // Set-Cookie: token=; expires=epoch response. If we navigate before the
    // POST settles, the browser cancels the in-flight XHR, the cookie is
    // never cleared server-side, and the next /me call re-authenticates the
    // "logged out" user. Reproduces only in prod because cross-origin RTT
    // (Netlify ↔ Render) is long enough to lose the race.
    await logout();
    navigate("/");
  };

  const profileLevel = user.level ?? 1;
  const avatarUrl = getAvatarUrl(user.avatarSeed);
  const allSkills = user.skills || [];

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-10 pl-page">
        {/* PROFILE HEADER */}
        <section className="pl-reveal pt-4">
          <div className="flex items-center justify-between mb-8">
            <span className="pl-eyebrow">
              <span className="dot" />
              Your profile
            </span>
            <button
              onClick={() => setShowEditInfoModal(true)}
              className="pl-btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: 13 }}
            >
              Edit info →
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-6">
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                  style={{
                    background: "var(--pl-surface)",
                    boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
                  }}
                />
                <div className="min-w-0">
                  <h1
                    className="pl-display truncate"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                  >
                    {user.name}
                  </h1>
                  <p
                    className="mt-2 text-base"
                    style={{ color: "var(--pl-ink-2)" }}
                  >
                    {user.department || "—"}{" "}
                    {user.year ? `· Year ${user.year}` : ""}
                  </p>
                  <div className="mt-2">
                    <TierBadge level={profileLevel} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="lg:col-span-4 lg:pl-8"
              style={{
                borderLeft: "1px solid var(--pl-line)",
              }}
            >
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => navigate("/connections")}
                  className="text-left transition rounded-lg p-2 -ml-2 hover:bg-neutral-50"
                >
                  <p
                    className="pl-display tabular-nums leading-none"
                    style={{ fontSize: "1.75rem" }}
                  >
                    {user.connectionsCount ?? 0}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--pl-ink-3)" }}
                  >
                    Connects →
                  </p>
                </button>
                <div>
                  <p
                    className="pl-display tabular-nums leading-none"
                    style={{ fontSize: "1.75rem" }}
                  >
                    {profileLevel}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--pl-ink-3)" }}
                  >
                    Level
                  </p>
                </div>
                <div>
                  <p
                    className="pl-display tabular-nums leading-none"
                    style={{ fontSize: "1.75rem" }}
                  >
                    {user.skills?.length ?? 0}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--pl-ink-3)" }}
                  >
                    Skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pl-rule" />

        {/* CARD PREVIEW */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2
                className="pl-display"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
              >
                How others see you
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--pl-ink-3)" }}>
                This is the card people see in Discover and Connections.
              </p>
            </div>
            <button
              onClick={() => setShowCardModal(true)}
              className="pl-btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: 13 }}
            >
              Customize →
            </button>
          </div>

          <div className="max-w-sm">
            <SkillCard
              userId={user._id}
              name={user.name}
              dept={user.department}
              year={user.year}
              level={profileLevel}
              skills={cardSkills}
              avatarSeed={user.avatarSeed}
              isSelf={true}
            />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2
              className="pl-display"
              style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
            >
              About
            </h2>
            <button
              onClick={() => setShowEditAboutModal(true)}
              className="pl-btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: 13 }}
            >
              Edit →
            </button>
          </div>

          <div className="pl-card p-5 space-y-3">
            <p className="leading-relaxed" style={{ color: "var(--pl-ink-2)" }}>
              {user.bio || (
                <span className="italic" style={{ color: "var(--pl-ink-3)" }}>
                  No bio added yet. Tell people what you're into!
                </span>
              )}
            </p>

            {(user.github || user.linkedin) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                    style={{
                      color: "var(--pl-ink-2)",
                      background: "var(--pl-surface)",
                      boxShadow: "inset 0 0 0 1px var(--pl-line)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.23c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.06 1.82 2.79 1.29 3.47.99.1-.77.42-1.29.76-1.59-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 text-sm font-medium transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM8 19H5V8h3v11zM6.5 6.7c-.97 0-1.75-.79-1.75-1.75S5.53 3.2 6.5 3.2s1.75.79 1.75 1.75S7.47 6.7 6.5 6.7zM20 19h-3v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.97V19h-3V8h2.88v1.5h.04c.4-.76 1.39-1.56 2.86-1.56 3.06 0 3.62 2.01 3.62 4.63V19z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SKILLS */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2
              className="pl-display"
              style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
            >
              Skills
            </h2>
            <button
              onClick={() => setShowProfileSkillsModal(true)}
              className="pl-btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: 13 }}
            >
              Manage →
            </button>
          </div>

          {profileSkills.length === 0 ? (
            <div
              className="pl-card p-8 text-center text-sm"
              style={{ color: "var(--pl-ink-3)" }}
            >
              Add your first skill to start showing up in Discover.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {profileSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="pl-card p-4 flex justify-between items-center"
                >
                  <span
                    className="font-medium"
                    style={{ color: "var(--pl-ink)" }}
                  >
                    {skill.name}
                  </span>
                  <span
                    className="text-sm font-semibold px-2.5 py-1 rounded-lg"
                    style={{
                      background: "var(--pl-accent-soft)",
                      color: "var(--pl-accent-hover)",
                    }}
                  >
                    Lv {skill.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NOTIFICATIONS */}
        <section>
          <h2
            className="pl-display mb-6"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
          >
            Notifications
          </h2>
          <EnablePushPrompt />
        </section>

        {/* ACCOUNT */}
        <section>
          <h2
            className="pl-display mb-6"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
          >
            Account
          </h2>
          <div className="pl-card p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs" style={{ color: "var(--pl-ink-3)" }}>
                Signed in as
              </p>
              <p
                className="font-medium mt-0.5"
                style={{ color: "var(--pl-ink)" }}
              >
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition"
              style={{
                color: "#dc2626",
                boxShadow: "inset 0 0 0 1px rgba(220, 38, 38, 0.2)",
                background: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(220,38,38,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* EDIT ABOUT MODAL */}
      {showEditAboutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit About"
        >
          <div
            ref={aboutModalRef}
            className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-lg font-bold">Edit About</h3>

            <textarea
              value={aboutForm.bio}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, bio: e.target.value })
              }
              maxLength={200}
              placeholder="Short bio"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="url"
              placeholder="GitHub link"
              value={aboutForm.github}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, github: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <input
              type="url"
              placeholder="LinkedIn link"
              value={aboutForm.linkedin}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, linkedin: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditAboutModal(false)}
                className="border px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button onClick={saveAbout} className="pl-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INFO MODAL */}
      {showEditInfoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit Info"
        >
          <div
            ref={infoModalRef}
            className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-lg font-bold">Edit Info</h3>

            <textarea
              value={infoForm.name}
              onChange={(e) =>
                setInfoForm({ ...infoForm, name: e.target.value })
              }
              maxLength={200}
              placeholder="Enter username"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="Department"
              value={infoForm.department}
              onChange={(e) =>
                setInfoForm({ ...infoForm, department: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="Year"
              value={infoForm.year}
              onChange={(e) =>
                setInfoForm({ ...infoForm, year: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditInfoModal(false)}
                className="border px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button onClick={saveInfo} className="pl-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SKILLS MODAL */}
      {showProfileSkillsModal && (
        <SkillSelectModal
          title="Select 4 skills for your profile"
          max={4}
          skills={allSkills}
          selected={profileSkills}
          setSelected={setProfileSkills}
          onSave={saveProfileSkills}
          onClose={() => setShowProfileSkillsModal(false)}
        />
      )}

      {/* CARD SKILLS MODAL */}
      {showCardModal && (
        <SkillSelectModal
          title="Select 3 skills for your card"
          max={3}
          skills={allSkills}
          selected={cardSkills}
          setSelected={setCardSkills}
          onSave={saveCardSkills}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </>
  );
};

// ================= REUSABLE MODAL =================
const SkillSelectModal = ({
  title,
  max,
  skills,
  selected,
  setSelected,
  onSave,
  onClose,
}) => {
  const [newSkill, setNewSkill] = useState("");
  const modalRef = useRef(null);
  useFocusTrap(modalRef, onClose);

  const displaySkills = [
    ...skills,
    ...selected.filter((s) => !skills.some((k) => k.name === s.name)),
  ];

  const addNewSkill = () => {
    const name = newSkill.trim();
    if (!name) return;
    if (displaySkills.some((s) => s.name === name)) return;
    if (selected.length >= max) return;

    setSelected((prev) => [...prev, { name, level: 0 }]);
    setNewSkill("");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4"
      >
        <h3 className="text-lg font-bold">{title}</h3>

        {/* ✅ ALWAYS AVAILABLE */}
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g. React)"
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button onClick={addNewSkill} className="pl-btn">
            Add
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {displaySkills.map((skill) => {
            const isSelected = selected.some((s) => s.name === skill.name);

            return (
              <label
                key={skill.name}
                className="flex justify-between items-center bg-slate-50 border rounded-lg px-4 py-2"
              >
                <span>{skill.name}</span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) {
                      setSelected((prev) =>
                        prev.filter((s) => s.name !== skill.name)
                      );
                    } else if (selected.length < max) {
                      setSelected((prev) => [...prev, skill]);
                    }
                  }}
                  style={{ accentColor: "var(--pl-accent)" }}
                />
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button onClick={onSave} className="pl-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
