import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

const CreateCommunity = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await api.post("/community", formData);
      navigate(`/community/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pl-page max-w-2xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="pl-btn-ghost mb-6"
          style={{ paddingLeft: "0.5rem" }}
        >
          ← Back
        </button>

        <div className="pl-reveal mb-8">
          <span className="pl-eyebrow">
            <span className="dot" />
            New community
          </span>
          <h1
            className="pl-display mt-5"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            Start a community.
          </h1>
          <p
            className="mt-3 text-base"
            style={{ color: "var(--pl-ink-2)" }}
          >
            Course group, club, or project space — give it a name and you're
            in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            label="Name"
            type="text"
            name="name"
            placeholder="e.g. CSE Year 3 — Algorithms"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--pl-ink-2)" }}
            >
              Description
            </label>
            <textarea
              name="description"
              placeholder="What's this community for?"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 rounded-xl bg-white text-sm outline-none transition"
              style={{
                color: "var(--pl-ink)",
                boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
                resize: "vertical",
              }}
            />
          </div>

          <Field
            label="Category"
            type="text"
            name="category"
            placeholder="e.g. Development, Sports, Society"
            value={formData.category}
            onChange={handleChange}
            required
          />

          <label
            className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition"
            style={{
              background: formData.isPrivate
                ? "var(--pl-accent-soft)"
                : "var(--pl-surface)",
              boxShadow: `inset 0 0 0 1px ${formData.isPrivate ? "rgba(255,90,31,0.25)" : "var(--pl-line)"}`,
            }}
          >
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              style={{ accentColor: "var(--pl-accent)" }}
              className="mt-1"
            />
            <span>
              <span
                className="block font-medium text-sm"
                style={{ color: "var(--pl-ink)" }}
              >
                Make it private
              </span>
              <span
                className="block text-xs mt-0.5"
                style={{ color: "var(--pl-ink-3)" }}
              >
                Only invited members can join.
              </span>
            </span>
          </label>

          {error && (
            <p
              className="text-sm px-4 py-2.5 rounded-xl"
              style={{
                color: "#dc2626",
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="pl-btn w-full justify-center"
            style={{ padding: "0.85rem 1.25rem", fontSize: 15 }}
          >
            {loading ? (
              <>
                <span
                  className="h-3.5 w-3.5 rounded-full animate-spin"
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                  }}
                />
                Creating…
              </>
            ) : (
              <>
                Create community
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>
      </main>
    </>
  );
};

const Field = ({ label, ...inputProps }) => (
  <div>
    <label
      className="block text-xs font-medium mb-1.5"
      style={{ color: "var(--pl-ink-2)" }}
    >
      {label}
    </label>
    <input
      {...inputProps}
      className="w-full p-3 rounded-xl bg-white text-sm outline-none transition"
      style={{
        color: "var(--pl-ink)",
        boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
      }}
    />
  </div>
);

export default CreateCommunity;
