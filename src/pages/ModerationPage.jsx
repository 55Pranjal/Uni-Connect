import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Skeleton } from "../components/Skeleton";
import { useCommunity } from "../hooks/useChannels";
import { useQuery } from "../hooks/useQuery";
import { invalidate } from "../lib/queryEvents";
import {
  getCommunityReports,
  updateReport,
  getCommunityAuditLog,
} from "../api/reports";

const STATUS_OPTIONS = ["open", "resolved", "dismissed"];
const AUDIT_LIMIT = 100;

const reportsKey = (communityId, status) =>
  communityId ? `reports:${communityId}:${status}` : null;
const auditKey = (communityId) =>
  communityId ? `audit-log:${communityId}:${AUDIT_LIMIT}` : null;

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
};

// Reports endpoint shape is not yet pinned by Track A — accept array or any
// of the common envelope keys ({ reports } / { data } / { items }).
const unwrapList = (payload, ...keys) => {
  if (Array.isArray(payload)) return payload;
  for (const k of keys) {
    if (Array.isArray(payload?.[k])) return payload[k];
  }
  return [];
};

const ModerationPage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const { data: communityData, loading: loadingCommunity } =
    useCommunity(communityId);
  const community = communityData?.community ?? null;
  const myRole = communityData?.myRole ?? null;
  const isAdmin = myRole === "admin";

  const [tab, setTab] = useState("reports");
  const [statusFilter, setStatusFilter] = useState("open");

  /* ===================== REPORTS ===================== */
  const {
    data: reportsData,
    loading: loadingReports,
    setData: setReportsData,
  } = useQuery(isAdmin ? reportsKey(communityId, statusFilter) : null, () =>
    getCommunityReports(communityId, { status: statusFilter }).then(
      (r) => r.data
    )
  );

  const reports = useMemo(
    () => unwrapList(reportsData, "reports", "data", "items"),
    [reportsData]
  );

  const patchReportLocally = (id, patch) => {
    setReportsData((prev) => {
      if (!prev) return prev;
      if (Array.isArray(prev)) {
        return prev.map((r) => (r._id === id ? { ...r, ...patch } : r));
      }
      const key = ["reports", "data", "items"].find((k) =>
        Array.isArray(prev?.[k])
      );
      if (!key) return prev;
      return {
        ...prev,
        [key]: prev[key].map((r) => (r._id === id ? { ...r, ...patch } : r)),
      };
    });
  };

  const removeReportLocally = (id) => {
    setReportsData((prev) => {
      if (!prev) return prev;
      if (Array.isArray(prev)) return prev.filter((r) => r._id !== id);
      const key = ["reports", "data", "items"].find((k) =>
        Array.isArray(prev?.[k])
      );
      if (!key) return prev;
      return { ...prev, [key]: prev[key].filter((r) => r._id !== id) };
    });
  };

  const decide = async (report, status) => {
    // Optimistic: drop it from the current list (it's leaving this status bucket).
    removeReportLocally(report._id);
    try {
      await updateReport(report._id, { status });
      // Invalidate every status bucket so the destination tab refetches if
      // the user switches over.
      STATUS_OPTIONS.forEach((s) => invalidate(reportsKey(communityId, s)));
    } catch {
      // Roll back on failure.
      patchReportLocally(report._id, { status: report.status });
      invalidate(reportsKey(communityId, statusFilter));
    }
  };

  /* ===================== AUDIT LOG ===================== */
  const { data: auditData, loading: loadingAudit } = useQuery(
    isAdmin && tab === "audit" ? auditKey(communityId) : null,
    () =>
      getCommunityAuditLog(communityId, { limit: AUDIT_LIMIT }).then(
        (r) => r.data
      )
  );

  const auditEntries = useMemo(
    () => unwrapList(auditData, "entries", "auditLog", "logs", "data"),
    [auditData]
  );

  /* ===================== RENDER ===================== */
  if (loadingCommunity && !communityData) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (!communityData) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-5 sm:px-8 py-16 text-center">
          <h1 className="pl-display text-2xl">Community not found</h1>
          <button
            onClick={() => navigate("/communities")}
            className="pl-btn mt-6"
          >
            Back to communities
          </button>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-5 sm:px-8 py-16 text-center">
          <h1 className="pl-display text-2xl">Admins only</h1>
          <p className="mt-2 text-slate-500">
            You need admin role in this community to view moderation.
          </p>
          <Link
            to={`/community/${communityId}`}
            className="pl-btn mt-6 inline-flex"
          >
            Back to community
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            to={`/community/${communityId}`}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← {community?.name || "Back to community"}
          </Link>
          <h1
            className="pl-display mt-3"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            Moderation
          </h1>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setTab("reports")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              tab === "reports"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setTab("audit")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              tab === "audit"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Audit Log
          </button>
        </div>

        {tab === "reports" ? (
          <ReportsTab
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            reports={reports}
            loading={loadingReports && !reportsData}
            onDecide={decide}
          />
        ) : (
          <AuditTab
            entries={auditEntries}
            loading={loadingAudit && !auditData}
          />
        )}
      </main>
    </>
  );
};

/* ============================================================
   REPORTS TAB
============================================================ */
const ReportsTab = ({
  statusFilter,
  setStatusFilter,
  reports,
  loading,
  onDecide,
}) => (
  <section>
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-sm text-slate-500 mr-1">Filter:</span>
      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          onClick={() => setStatusFilter(s)}
          className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
            statusFilter === s
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {s}
        </button>
      ))}
    </div>

    {loading ? (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    ) : reports.length === 0 ? (
      <div className="py-16 text-center bg-white border border-dashed border-slate-300 rounded-xl">
        <p className="pl-display text-xl">No {statusFilter} reports.</p>
        <p className="text-sm text-slate-500 mt-1">Nothing to review here.</p>
      </div>
    ) : (
      <ul className="space-y-3">
        {reports.map((r) => (
          <ReportRow
            key={r._id}
            report={r}
            statusFilter={statusFilter}
            onDecide={onDecide}
          />
        ))}
      </ul>
    )}
  </section>
);

const displayName = (ref) => {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  return ref.name || ref.email || ref._id || "—";
};

const ReportRow = ({ report, statusFilter, onDecide }) => {
  const reporter =
    report.reporter ?? report.reporterId ?? report.reportedBy ?? null;
  const target = report.target ?? report.targetId ?? null;

  return (
    <li className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              {report.reason || "—"}
            </span>
            <span className="text-xs text-slate-500">
              {report.targetType || "content"}
            </span>
            <span className="text-xs text-slate-400">
              · {formatDateTime(report.createdAt)}
            </span>
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-medium">{displayName(reporter)}</span>
            <span className="text-slate-400"> reported </span>
            <span className="font-mono text-xs text-slate-600">
              {displayName(target)}
            </span>
          </p>
          {report.details && (
            <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
              {report.details}
            </p>
          )}
        </div>

        {statusFilter === "open" && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onDecide(report, "resolved")}
              className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition"
            >
              Resolve
            </button>
            <button
              onClick={() => onDecide(report, "dismissed")}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

/* ============================================================
   AUDIT LOG TAB
============================================================ */
const AuditTab = ({ entries, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-16 text-center bg-white border border-dashed border-slate-300 rounded-xl">
        <p className="pl-display text-xl">No audit entries yet.</p>
        <p className="text-sm text-slate-500 mt-1">
          Moderation actions will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
      {entries.map((e) => (
        <li
          key={e._id || `${e.action}-${e.createdAt}`}
          className="px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <span className="text-xs font-mono text-slate-500 shrink-0">
            {formatDateTime(e.createdAt)}
          </span>
          <span className="text-sm font-semibold text-neutral-900">
            {e.action}
          </span>
          <span className="text-xs text-slate-400">
            {e.targetType || "—"}
            {e.targetId ? ` · ${displayName(e.targetId)}` : ""}
          </span>
          <span className="text-xs text-slate-400 ml-auto">
            by {displayName(e.actor)}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ModerationPage;
