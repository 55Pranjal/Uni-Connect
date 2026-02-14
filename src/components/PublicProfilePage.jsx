import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/SkillCard";
import { getAvatarUrl } from "../utils/avatar";
import { calculateProfileLevel } from "../utils/profileLevel";
import { useAuth } from "../context/AuthContext";

const PublicProfilePage = () => {
  const { id } = useParams();
  const { user: loggedInUser } = useAuth(); // 🔥 single source of truth

  const [user, setUser] = useState(null);
  const [cardSkills, setCardSkills] = useState([]);
  const [profileSkills, setProfileSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isSelf = loggedInUser?._id === id;

  /* ================= FETCH PUBLIC USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/public/${id}`,
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setUser(data);
        setCardSkills(data.cardSkills || []);
        setProfileSkills(data.profileSkills || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
          Loading profile…
        </div>
        <Footer />
      </>
    );
  }

  /* ================= ERROR ================= */
  if (error || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center text-red-500">
          {error || "Profile not found"}
        </div>
        <Footer />
      </>
    );
  }

  const profileLevel = calculateProfileLevel(user.skills || []);
  const avatarUrl = getAvatarUrl(user.avatarSeed);

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* PROFILE HEADER */}
        <section className="flex items-center gap-5">
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full ring-2 ring-indigo-500 bg-white"
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
            <p className="text-slate-500">
              {user.department} • {user.year}
            </p>
            <p className="text-sm text-indigo-600 font-semibold mt-1">
              Profile Level: Lv. {profileLevel}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">Connections</p>
            <p className="text-2xl font-extrabold text-indigo-600">
              {user.connectionsCount}
            </p>
          </div>
        </section>

        {/* CARD PREVIEW */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Skill Card</h2>

          <div className="max-w-sm">
            <SkillCard
              key={user._id}
              userId={user._id}
              name={user.name}
              dept={user.department}
              year={user.year}
              avatarSeed={user.avatarSeed || user._id}
              skills={user.skills || []}
              connectionStatus={user.connectionStatus}
              isSelf={isSelf} // 🔥 now correct
            />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">About</h2>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <p className="text-slate-700">{user.bio || "No bio added."}</p>

            <div className="flex gap-4 text-sm">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  GitHub
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Skills</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {profileSkills.length === 0 ? (
              <p className="text-slate-500">No skills added.</p>
            ) : (
              profileSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between"
                >
                  <span>{skill.name}</span>
                  <span className="font-semibold">Lv. {skill.level}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PublicProfilePage;
