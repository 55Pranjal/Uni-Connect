import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const { token } = useAuth(); // 🔥 single source of truth

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
    if (!token) return; // prevent broken submit

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      navigate("/"); // 🔥 no hard reload
    } catch (err) {
      console.error("Onboarding failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
        <h1 className="text-center font-extrabold text-2xl text-slate-800 mb-1">
          Complete Your Profile
        </h1>
        <p className="text-center text-slate-500 mb-6">Step {step} of 4</p>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <select
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept}>{dept}</option>
              ))}
            </select>

            <select
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
            >
              <option value="">Select Year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <p className="font-semibold text-slate-700 mb-3">
              Select your interests
            </p>
            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleSelect("interests", interest)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition
                    ${
                      formData.interests.includes(interest)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <p className="font-semibold text-slate-700 mb-2">
              Skills you can help with
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {interestsList.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSelect("skillsCanHelp", skill)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition
                    ${
                      formData.skillsCanHelp.includes(skill)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Topics you need help in
            </label>
            <input
              type="text"
              placeholder="e.g. React hooks, Graphs, SQL"
              value={formData.topicsNeedHelp}
              onChange={(e) =>
                setFormData({ ...formData, topicsNeedHelp: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <textarea
              rows="3"
              placeholder="Short bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 resize-none"
            />

            <input
              type="url"
              placeholder="GitHub profile link"
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />

            <input
              type="url"
              placeholder="LinkedIn profile link"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-slate-500 hover:text-slate-700"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!token}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
