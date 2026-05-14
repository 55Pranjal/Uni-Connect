import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/cards/SkillCard";

import { getAvatarUrl } from "../utils/avatar";
import { useAuth } from "../context/AuthContext";
import TierBadge from "./TierBadge";

const PublicProfilePage = () => {
  const { id } = useParams();
  const { user: loggedInUser } = useAuth();

  const [user, setUser] = useState(null);
  const [profileSkills, setProfileSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isSelf = loggedInUser?._id === id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/public/${id}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");
        setUser(data);
        setProfileSkills(data.profileSkills || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          className="min-h-[60vh] flex flex-col items-center justify-center gap-3"
          style={{ color: "var(--pl-ink-3)" }}
        >
          <span
            className="h-6 w-6 rounded-full animate-spin"
            style={{
              border: "2px solid var(--pl-line)",
              borderTopColor: "var(--pl-ink)",
            }}
          />
          <p className="text-sm">Loading profile…</p>
        </div>
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
          {error || "Profile not found"}
        </div>
        <Footer />
      </>
    );
  }

  const profileLevel = user.level ?? 1;
  const avatarUrl = getAvatarUrl(user.avatarSeed);

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-10 pl-page">
        {/* PROFILE HEADER */}
        <section className="pl-reveal pt-4">
          <div className="flex items-center justify-between mb-8">
            <span className="pl-eyebrow">
              <span className="dot" />
              Public profile
            </span>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 flex items-center gap-6">
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

            <div
              className="lg:col-span-4 lg:pl-8"
              style={{ borderLeft: "1px solid var(--pl-line)" }}
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
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
                    Connections
                  </p>
                </div>
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
              </div>
            </div>
          </div>
        </section>

        <div className="pl-rule" />

        {/* CARD */}
        <section>
          <h2
            className="pl-display mb-6"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
          >
            Skill card
          </h2>
          <div className="max-w-sm">
            <SkillCard
              key={user._id}
              userId={user._id}
              name={user.name}
              dept={user.department}
              year={user.year}
              avatarSeed={user.avatarSeed || user._id}
              level={profileLevel}
              skills={user.skills || []}
              connectionStatus={user.connectionStatus}
              isSelf={isSelf}
            />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <h2
            className="pl-display mb-6"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
          >
            About
          </h2>
          <div className="pl-card p-5 space-y-3">
            <p
              className="leading-relaxed"
              style={{ color: "var(--pl-ink-2)" }}
            >
              {user.bio || (
                <span
                  className="italic"
                  style={{ color: "var(--pl-ink-3)" }}
                >
                  No bio added.
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
                    GitHub
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                    style={{
                      color: "var(--pl-ink-2)",
                      background: "var(--pl-surface)",
                      boxShadow: "inset 0 0 0 1px var(--pl-line)",
                    }}
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SKILLS */}
        <section>
          <h2
            className="pl-display mb-6"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)" }}
          >
            Skills
          </h2>
          {profileSkills.length === 0 ? (
            <div
              className="pl-card p-8 text-center text-sm"
              style={{ color: "var(--pl-ink-3)" }}
            >
              No skills added.
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
      </main>

      <Footer />
    </>
  );
};

export default PublicProfilePage;
