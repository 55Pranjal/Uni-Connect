import { useEffect, useState } from "react";

export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [cardSkills, setCardSkills] = useState([]);
  const [profileSkills, setProfileSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setUser(data.user);

        setCardSkills(
          data.user.skills?.filter((s) =>
            data.user.cardSkills?.includes(s.name)
          ) || []
        );

        setProfileSkills(
          data.user.skills?.filter((s) =>
            data.user.profileSkills?.includes(s.name)
          ) || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    setUser,
    cardSkills,
    setCardSkills,
    profileSkills,
    setProfileSkills,
    loading,
    error,
  };
};
