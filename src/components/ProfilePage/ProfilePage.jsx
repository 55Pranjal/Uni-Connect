import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useProfile } from "./hooks/useProfile";

import ProfileHeader from "./components/ProfileHeader";
import ProfileCardPreview from "./components/ProfileCardPreview";
import ProfileAbout from "./components/ProfileAbout";
import ProfileSkills from "./components/ProfileSkills";
import ProfileAccount from "./components/ProfileAccount";

import EditAboutModal from "../components/ProfilePage/modals/EditAboutModal";
import EditInfoModal from "../components/ProfilePage/modals/EditInfoModal";
import SkillSelectModal from "../components/ProfilePage/modals/SkillSelectModal";

const ProfilePage = () => {
  const {
    user,
    setUser,
    cardSkills,
    setCardSkills,
    profileSkills,
    setProfileSkills,
    loading,
    error,
  } = useProfile();

  /* ================= MODAL STATE ================= */
  const [showEditAboutModal, setShowEditAboutModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showProfileSkillsModal, setShowProfileSkillsModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  /* ================= FORM STATE ================= */
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

  if (loading) return <p className="text-center mt-10">Loading…</p>;
  if (error || !user)
    return (
      <p className="text-center mt-10 text-red-500">Error loading profile</p>
    );

  const allSkills = user.skills || [];

  /* ================= SAVE HANDLERS ================= */

  const saveAbout = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(aboutForm),
    });

    setUser((prev) => ({ ...prev, ...aboutForm }));
    setShowEditAboutModal(false);
  };

  const saveInfo = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(infoForm),
    });

    setUser((prev) => ({ ...prev, ...infoForm }));
    setShowEditInfoModal(false);
  };

  const saveCardSkills = async () => {
    const token = localStorage.getItem("token");

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

  const saveProfileSkills = async () => {
    const token = localStorage.getItem("token");

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

    setShowProfileSkillsModal(false);
  };

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        <ProfileHeader user={user} onEdit={() => setShowEditInfoModal(true)} />

        <ProfileCardPreview
          user={user}
          skills={cardSkills}
          onEdit={() => setShowCardModal(true)}
        />

        <ProfileAbout user={user} onEdit={() => setShowEditAboutModal(true)} />

        <ProfileSkills
          skills={profileSkills}
          onEdit={() => setShowProfileSkillsModal(true)}
        />

        <ProfileAccount email={user.email} />
      </main>

      {/* ================= MODALS ================= */}

      {showEditAboutModal && (
        <EditAboutModal
          form={aboutForm}
          setForm={setAboutForm}
          onSave={saveAbout}
          onClose={() => setShowEditAboutModal(false)}
        />
      )}

      {showEditInfoModal && (
        <EditInfoModal
          form={infoForm}
          setForm={setInfoForm}
          onSave={saveInfo}
          onClose={() => setShowEditInfoModal(false)}
        />
      )}

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

      <Footer />
    </>
  );
};

export default ProfilePage;
