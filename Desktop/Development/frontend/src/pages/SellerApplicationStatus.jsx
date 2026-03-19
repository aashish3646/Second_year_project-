import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sellersApi } from '../services/sellersApi';

const statusLabel = (s) =>
  ({
    pending_review: 'Pending review',
    under_verification: 'Under verification',
    needs_more_documents: 'Needs more documents',
    approved: 'Approved',
    rejected: 'Rejected',
    suspended: 'Suspended',
  })[s] || s;

const chipClass = (s) =>
  ({
    approved: 'bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/30',
    rejected: 'bg-rose-500/15 text-rose-100 ring-1 ring-rose-500/30',
    needs_more_documents: 'bg-amber-500/15 text-amber-100 ring-1 ring-amber-500/30',
    pending_review: 'bg-white/10 text-white ring-1 ring-white/10',
    under_verification: 'bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-500/30',
    suspended: 'bg-slate-500/15 text-slate-100 ring-1 ring-slate-500/30',
  })[s] || 'bg-white/10 text-white ring-1 ring-white/10';

export default function SellerApplicationStatus() {
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await sellersApi.myApplication();
        if (!cancelled) setApp(data);
      } catch (e) {
        if (!cancelled) setApp(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-3 w-full animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="card p-6">
        <div className="text-2xl font-black tracking-tight text-white">No seller application yet</div>
        <p className="mt-2 text-sm text-slate-300">Start your verification workflow to sell items on the platform.</p>
        <div className="mt-4">
          <Link to="/dashboard/become-seller" className="btn btn-primary">
            Become a Seller
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-400">Seller verification</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-white">Application status</div>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-black ${chipClass(app.status)}`}>
            {statusLabel(app.status)}
          </div>
        </div>

        {app.admin_remarks && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold text-slate-400">Admin remarks</div>
            <div className="mt-1 text-sm text-slate-200">{app.admin_remarks}</div>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="text-sm font-black text-white">Submitted info</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-200">
            <div>
              <span className="text-slate-400">Seller type:</span> <span className="font-semibold">{app.seller_type}</span>
            </div>
            <div>
              <span className="text-slate-400">Categories:</span>{' '}
              <span className="font-semibold">{(app.intended_item_categories || []).join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400">Name:</span> <span className="font-semibold">{app.full_name_or_business_name}</span>
            </div>
            <div>
              <span className="text-slate-400">Email:</span> <span className="font-semibold">{app.email}</span>
            </div>
            <div>
              <span className="text-slate-400">Phone:</span> <span className="font-semibold">{app.phone}</span>
            </div>
            <div>
              <span className="text-slate-400">Address:</span> <span className="font-semibold">{app.address}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-black text-white">Uploaded documents</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-200">
            {(app.documents || []).length === 0 ? (
              <div className="text-slate-400">No documents uploaded yet.</div>
            ) : (
              app.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="font-semibold">{d.document_type}</div>
                  <a className="text-xs font-bold text-indigo-200 hover:text-indigo-100" href={d.file} target="_blank" rel="noreferrer">
                    View
                  </a>
                </div>
              ))
            )}
          </div>

          {(app.status === 'needs_more_documents' || app.status === 'rejected') && (
            <div className="mt-4">
              <Link to="/dashboard/become-seller" className="btn btn-primary">
                Resubmit / Upload more docs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

