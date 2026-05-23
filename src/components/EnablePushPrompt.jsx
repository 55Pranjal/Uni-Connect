import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import {
  enablePushNotifications,
  disablePushNotifications,
  getPushPermissionState,
} from "../utils/pwa";

const Bell = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.7}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.17V11a6 6 0 10-12 0v3.17a2 2 0 01-.6 1.43L4 17h5m6 0a3 3 0 11-6 0"
    />
  </svg>
);

/**
 * Push-notifications opt-in card for the Profile page.
 *
 * Doesn't auto-prompt — surfacing the OS permission dialog without a user
 * gesture trains people to click "Block" reflexively. User taps the button,
 * then the prompt fires.
 *
 * States:
 *   off          — supported, permission "default" → "Turn on notifications"
 *   loading      — request in flight
 *   on           — subscribed and active
 *   denied       — OS-level blocked; only the user can flip it in browser settings
 *   unsupported  — older Safari, embedded webviews, etc.
 */
const EnablePushPrompt = () => {
  const { notify } = useToast();
  const [state, setState] = useState("off");

  useEffect(() => {
    const perm = getPushPermissionState();
    if (perm === "unsupported") setState("unsupported");
    else if (perm === "denied") setState("denied");
    else if (perm === "granted") {
      // Check whether we actually have a live subscription, not just permission.
      navigator.serviceWorker
        ?.getRegistration()
        ?.then((reg) => reg?.pushManager.getSubscription())
        .then((sub) => setState(sub ? "on" : "off"))
        .catch(() => setState("off"));
    } else {
      setState("off");
    }
  }, []);

  const handleEnable = async () => {
    setState("loading");
    const res = await enablePushNotifications();
    if (res.ok) {
      setState("on");
      notify({
        title: "Notifications enabled",
        subtitle: "You'll get notified when something happens.",
        severity: "success",
      });
      return;
    }
    if (res.reason === "denied") setState("denied");
    else if (res.reason === "unsupported") setState("unsupported");
    else {
      setState("off");
      const subtitle =
        res.reason === "no-vapid"
          ? "Server push key isn't configured yet."
          : "Couldn't subscribe. Try again later.";
      notify({
        title: "Couldn't turn on notifications",
        subtitle,
        severity: "error",
      });
    }
  };

  const handleDisable = async () => {
    setState("loading");
    await disablePushNotifications();
    setState("off");
    notify({ title: "Notifications turned off" });
  };

  let label;
  let subtitle;
  let action = null;

  if (state === "unsupported") {
    label = "Push notifications";
    subtitle =
      "This browser doesn't support push. On iOS, add UniConnect to your Home Screen and try again.";
  } else if (state === "denied") {
    label = "Notifications blocked";
    subtitle =
      "You've blocked notifications. Enable them in your browser's site settings, then come back here.";
  } else if (state === "on") {
    label = "Notifications are on";
    subtitle = "You'll see system notifications when something happens.";
    action = (
      <button
        type="button"
        onClick={handleDisable}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
      >
        Turn off
      </button>
    );
  } else if (state === "loading") {
    label = "Push notifications";
    subtitle = "Working…";
    action = (
      <button
        type="button"
        disabled
        className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg opacity-60"
      >
        Please wait…
      </button>
    );
  } else {
    label = "Push notifications";
    subtitle =
      "Get a system notification for new DMs, replies, and connection updates — even when this tab is closed.";
    action = (
      <button
        type="button"
        onClick={handleEnable}
        className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition"
      >
        Turn on
      </button>
    );
  }

  return (
    <div className="pl-card p-5 flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl inline-flex items-center justify-center shrink-0"
        style={{
          background: "var(--pl-accent-soft)",
          color: "var(--pl-accent-hover)",
        }}
      >
        <Bell />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium" style={{ color: "var(--pl-ink)" }}>
          {label}
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--pl-ink-3)" }}>
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
};

export default EnablePushPrompt;
