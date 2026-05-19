import { useRef, useState } from "react";
import useFocusTrap from "../../hooks/useFocusTrap";
import { useToast } from "../../context/ToastContext";
import { createReport } from "../../api/reports";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "hate", label: "Hate speech" },
  { value: "nsfw", label: "NSFW / explicit" },
  { value: "other", label: "Other" },
];

const MAX_DETAILS = 500;

const ReportModal = ({ open, onClose, targetType, targetId, communityId }) => {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const modalRef = useRef(null);
  useFocusTrap(modalRef, onClose, open);

  if (!open) return null;

  const reset = () => {
    setReason("spam");
    setDetails("");
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!targetType || !targetId) return;
    try {
      setSubmitting(true);
      await createReport({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
        ...(communityId ? { communityId } : {}),
      });
      notify({
        title: "Report submitted",
        subtitle: "Thanks — a moderator will take a look.",
        severity: "success",
      });
      reset();
      onClose();
    } catch {
      /* api interceptor surfaces the toast */
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Report content"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg flex flex-col"
      >
        <h3 className="text-xl font-bold mb-1 text-slate-800">
          Report content
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Pick the reason that fits best. Add details if it helps a moderator.
        </p>

        <fieldset className="mb-4">
          <legend className="block text-sm font-medium text-slate-700 mb-2">
            Reason
          </legend>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                  reason === r.value
                    ? "border-neutral-900 bg-slate-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  style={{ accentColor: "var(--pl-accent)" }}
                />
                <span className="text-sm text-slate-700">{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mb-4">
          <label
            htmlFor="report-details"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Details <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="report-details"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, MAX_DETAILS))}
            placeholder="What happened?"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none transition resize-none"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">
            {details.length}/{MAX_DETAILS}
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
