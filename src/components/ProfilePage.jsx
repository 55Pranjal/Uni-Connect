import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/SkillCard";
import { getAvatarUrl } from "../utils/avatar";
import { calculateProfileLevel } from "../utils/profileLevel";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  // ✅ Correct hook usage — only at top level
  const { user: authUser, logout } = useAuth();
  const token = localStorage.getItem("token");

  const [showCardModal, setShowCardModal] = useState(false);
  const [showProfileSkillsModal, setShowProfileSkillsModal] = useState(false);
  const [showEditAboutModal, setShowEditAboutModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);

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
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setUser(data.user);

        setAboutForm({
          bio: data.user.bio || "",
          github: data.user.github || "",
          linkedin: data.user.linkedin || "",
        });

        if (data.user.cardSkills?.length === 3) {
          setCardSkills(
            data.user.skills.filter((s) =>
              data.user.cardSkills.includes(s.name),
            ),
          );
        } else {
          setCardSkills(data.user.skills?.slice(0, 3) || []);
        }

        if (data.user.profileSkills?.length === 4) {
          setProfileSkills(
            data.user.skills.filter((s) =>
              data.user.profileSkills.includes(s.name),
            ),
          );
        } else {
          setProfileSkills(data.user.skills?.slice(0, 4) || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  /* ================= SAVE ABOUT ================= */
  const saveAbout = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(aboutForm),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser((prev) => ({ ...prev, ...aboutForm }));
      setShowEditAboutModal(false);
    } catch (err) {
      console.error("About update failed:", err);
    }
  };

  /* ================= SAVE INFO ================= */
  const saveInfo = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(infoForm),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser((prev) => ({ ...prev, ...infoForm }));
      setShowEditInfoModal(false);
    } catch (err) {
      console.error("Info update failed:", err);
    }
  };

  /* ================= SAVE CARD SKILLS ================= */
  const saveCardSkills = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/card-skills`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cardSkills: cardSkills.map((s) => s.name),
      }),
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
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillsCanHelp: newSkills,
        }),
      });
    }

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile-skills`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        profileSkills: profileSkills.map((s) => s.name),
      }),
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
        <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
          Loading profile…
        </div>
        <Footer />
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center text-red-500">
          {error || "Something went wrong"}
        </div>
        <Footer />
      </>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const profileLevel = calculateProfileLevel(user.skills);
  const avatarUrl = getAvatarUrl(user.avatarSeed);
  const allSkills = user.skills || [];

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

          <div className="flex flex-col mb-10">
            <button
              onClick={() => setShowEditInfoModal(true)}
              className="text-sm text-indigo-600 hover:underline mb-4"
            >
              Edit
            </button>

            {/* Connections */}
            <button
              onClick={() => navigate("/connections")}
              className="text-center group"
            >
              <p className="text-sm text-slate-500 group-hover:text-indigo-600">
                Connects{" "}
              </p>
              <p className="text-2xl font-extrabold text-indigo-600">
                {user.connectionsCount}
              </p>
            </button>
          </div>
        </section>

        {/* CARD PREVIEW */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              How others see you
            </h2>
            <button
              onClick={() => setShowCardModal(true)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Customize Card
            </button>
          </div>

          <div className="max-w-sm">
            <SkillCard
              userId={user._id}
              name={user.name}
              dept={user.department}
              year={user.year}
              profileLevel={profileLevel}
              skills={cardSkills}
              avatarSeed={user.avatarSeed}
              isSelf={true}
            />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-800">About</h2>
            <button
              onClick={() => setShowEditAboutModal(true)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Edit
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <p className="text-slate-700">{user.bio || "No bio added yet."}</p>

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

        {/* ✅ SKILLS SECTION (RESTORED) */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Skills</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {profileSkills.map((skill) => (
              <div
                key={skill.name}
                className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between"
              >
                <span>{skill.name}</span>
                <span className="font-semibold">Lv. {skill.level}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowProfileSkillsModal(true)}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            View all skills
          </button>
        </section>

        {/* ACCOUNT */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Account</h2>
          <div className="bg-white border rounded-xl p-5 text-sm">
            <p>Email: {user.email}</p>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline mt-2"
            >
              Logout
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* EDIT ABOUT MODAL */}
      {showEditAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
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
              <button
                onClick={saveAbout}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INFO MODAL */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
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
              <button
                onClick={saveInfo}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold">{title}</h3>

        {/* ✅ ALWAYS AVAILABLE */}
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g. React)"
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            onClick={addNewSkill}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
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
                        prev.filter((s) => s.name !== skill.name),
                      );
                    } else if (selected.length < max) {
                      setSelected((prev) => [...prev, skill]);
                    }
                  }}
                  className="accent-indigo-600"
                />
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
