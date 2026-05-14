import React from "react";

const ProfileDecisionV2 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
        <h1 className="text-center font-extrabold text-3xl text-slate-800 mb-2">
          You’re Almost There 🎯
        </h1>

        <p className="text-center text-slate-500 mb-6">
          Complete your profile to unlock meaningful conversations.
        </p>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>Profile completion</span>
            <span>30%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-neutral-900 h-2 rounded-full w-[30%]" />
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <p className="font-semibold text-slate-700 mb-2">
            Completing your profile lets you:
          </p>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Get faster replies</li>
            <li>Find students with matching interests</li>
            <li>Request & offer help</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href="/onboarding"
            className="w-full text-center py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition"
          >
            Complete Profile
          </a>

          <a
            href="/"
            className="w-full text-center py-3 rounded-lg text-slate-600 hover:text-slate-800 font-medium"
          >
            I’ll do this later
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileDecisionV2;
