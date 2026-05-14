import { useState } from "react";

const getStatusColor = (status) => {
  switch (status) {
    case "open":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "in-progress":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "resolved":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const HelpRequestCard = ({ request, currentUserId, onClaim, onResolve }) => {
  const isPoster = request.postedBy?._id === currentUserId;
  const isResolved = request.status === "resolved";
  const isInProgress = request.status === "in-progress";
  const isOpen = request.status === "open";

  const [resolverIdInput, setResolverIdInput] = useState("");
  const [showResolveInput, setShowResolveInput] = useState(false);

  const handleResolveClick = () => {
    // If it was claimed and has a resolvedBy from the claim action,
    // or we just want to resolve without specifying explicitly (uses claimed user)
    if (request.resolvedBy && !showResolveInput) {
      onResolve(request._id);
    } else if (!showResolveInput) {
      // Prompt for resolver input if no one claimed it explicitly
      setShowResolveInput(true);
    } else {
      // Submit with input
      onResolve(request._id, { resolvedBy: resolverIdInput || null });
      setShowResolveInput(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-lg text-slate-800">{request.title}</h4>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
            request.status
          )} capitalize whitespace-nowrap ml-4`}
        >
          {request.status}
        </span>
      </div>

      <p className="text-slate-600 mb-4 whitespace-pre-wrap text-sm">
        {request.description}
      </p>

      {request.skillTags && request.skillTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {request.skillTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">
            Posted by{" "}
            <span className="font-semibold text-slate-700">
              {request.postedBy?.name || "Unknown"}
            </span>
          </span>
          {request.resolvedBy && (
            <span className="text-xs text-slate-500 mt-1">
              Helper:{" "}
              <span className="font-semibold text-slate-700">
                {request.resolvedBy?.name || "Unknown"}
              </span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!isPoster && isOpen && (
            <button
              onClick={() => onClaim(request._id)}
              className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium hover:bg-orange-100 transition"
            >
              Claim Request
            </button>
          )}

          {isPoster && !isResolved && (
            <div className="flex flex-col items-end gap-2">
              {showResolveInput && (
                <div className="flex gap-2 mb-1">
                  <input
                    type="text"
                    placeholder="Helper User ID (optional)"
                    value={resolverIdInput}
                    onChange={(e) => setResolverIdInput(e.target.value)}
                    className="px-2 py-1 border rounded text-xs w-40"
                  />
                </div>
              )}
              <button
                onClick={handleResolveClick}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition shadow-sm"
              >
                Mark Resolved
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpRequestCard;
