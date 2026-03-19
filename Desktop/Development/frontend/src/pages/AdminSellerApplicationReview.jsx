import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sellersApi } from '../services/sellersApi';

export default function AdminSellerApplicationReview() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await sellersApi.adminGetApplication(id);
      setApp(data);
      setRemarks(data?.admin_remarks || '');
    } catch (e) {
      toast.error('Failed to load application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const act = async (action) => {
    setSaving(true);
    try {
      await sellersApi.adminReviewApplication(id, { action, remarks });
      toast.success('Updated');
      await load();
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.detail || (typeof data === 'object' ? Object.values(data).flat().join(', ') : null) || 'Update failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="h-4 w-60 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="card p-6">
        <div className="text-sm text-slate-300">Not found.</div>
        <div className="mt-4">
          <Link className="btn btn-ghost" to="/dashboard/admin/seller-applications">
            Back
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
            <div className="text-xs font-semibold text-slate-400">Admin review</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-white">Seller application #{app.id}</div>
            <div className="mt-1 text-sm text-slate-300">Status: {app.status}</div>
          </div>
          <Link className="btn btn-ghost" to="/dashboard/admin/seller-applications">
            Back to list
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="text-sm font-black text-white">Applicant details</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-200">
            <div>
              <span className="text-slate-400">User:</span> <span className="font-semibold">{app.user}</span>
            </div>
            <div>
              <span className="text-slate-400">Seller type:</span> <span className="font-semibold">{app.seller_type}</span>
            </div>
            <div>
              <span className="text-slate-400">Categories:</span>{' '}
              <span className="font-semibold">{(app.intended_item_categories || []).join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400">Name:</span>{' '}
              <span className="font-semibold">{app.full_name_or_business_name}</span>
            </div>
            <div>
              <span className="text-slate-400">Phone:</span> <span className="font-semibold">{app.phone}</span>
            </div>
            <div>
              <span className="text-slate-400">Email:</span> <span className="font-semibold">{app.email}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-black text-white">Documents</div>
          <div className="mt-3 grid gap-2">
            {(app.documents || []).length === 0 ? (
              <div className="text-sm text-slate-400">No docs uploaded.</div>
            ) : (
              app.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-sm font-semibold text-slate-200">{d.document_type}</div>
                  <a className="text-xs font-bold text-indigo-200 hover:text-indigo-100" href={d.file} target="_blank" rel="noreferrer">
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-black text-white">Decision</div>
        <label className="mt-3 block text-xs font-semibold text-slate-300">Remarks (shown to seller)</label>
        <textarea
          className="input mt-2 min-h-24 resize-y py-3"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary" type="button" onClick={() => act('approve')} disabled={saving}>
            Approve seller
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => act('needs_more_documents')} disabled={saving}>
            Needs more docs
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => act('under_verification')} disabled={saving}>
            Under verification
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => act('reject')} disabled={saving}>
            Reject
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => act('suspend')} disabled={saving}>
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
}

