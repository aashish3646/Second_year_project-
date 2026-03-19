import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { sellersApi } from '../services/sellersApi';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const SELLER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
  { value: 'corporate', label: 'Corporate' },
];

const ITEM_CATEGORIES = [
  { value: 'general_goods', label: 'General Goods' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'property', label: 'Property / Real Estate' },
  { value: 'business_inventory', label: 'Business Inventory' },
  { value: 'luxury', label: 'Luxury / High Value Items' },
];

const DOC_LABELS = {
  citizenship: 'Citizenship',
  passport: 'Passport',
  selfie: 'Selfie / Face verification',
  business_registration: 'Business registration certificate',
  company_registration: 'Company registration document',
  pan_vat: 'PAN / VAT document',
  authorization_letter: 'Authorization letter',
  authorized_representative_id: 'Authorized representative ID',
  vehicle_bluebook: 'Vehicle registration / Bluebook',
  tax_clearance: 'Tax clearance (optional)',
  property_ownership: 'Ownership certificate',
  property_legal: 'Property legal document',
  invoice_source_proof: 'Invoice / source proof',
  ownership_proof: 'Proof of ownership',
  authenticity_proof: 'Authenticity proof (optional)',
};

function Stepper({ step }) {
  const labels = ['Seller type', 'Details', 'Item category', 'Documents', 'Payout', 'Review'];
  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-2">
        {labels.map((l, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div
              key={l}
              className={[
                'rounded-xl px-3 py-2 text-xs font-bold',
                active ? 'bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-500/40' : '',
                done ? 'bg-white/10 text-white' : '',
                !active && !done ? 'bg-white/5 text-slate-400' : '',
              ].join(' ')}
            >
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BecomeSeller() {
  const navigate = useNavigate();
  const { user, isVerifiedSeller } = useAuth();
  const [step, setStep] = useState(0);

  const [sellerType, setSellerType] = useState('individual');
  const [categories, setCategories] = useState(['general_goods']);

  const [details, setDetails] = useState({
    full_name_or_business_name: user?.username ?? '',
    phone: user?.phone_number ?? '',
    email: user?.email ?? '',
    address: user?.address ?? '',
    city: '',
    country: 'Nepal',
    submission_notes: '',
  });

  const [payout, setPayout] = useState({
    preferred_method: 'bank_transfer',
    account_name: '',
    identifier: '',
    provider: '',
  });

  const [requirements, setRequirements] = useState({ required_document_types: [], all_document_types: [] });
  const [docs, setDocs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const canProceed = useMemo(() => {
    if (step === 0) return !!sellerType;
    if (step === 1) return !!details.full_name_or_business_name && !!details.phone && !!details.email && !!details.address;
    if (step === 2) return categories.length > 0;
    if (step === 3) {
      const required = requirements.required_document_types || [];
      return required.every((t) => docs?.[t] instanceof File);
    }
    if (step === 4) return !!payout.preferred_method;
    return true;
  }, [categories.length, details, docs, payout.preferred_method, requirements.required_document_types, sellerType, step]);

  useEffect(() => {
    let cancelled = false;
    async function fetchReq() {
      try {
        const { data } = await sellersApi.requirements({
          seller_type: sellerType,
          intended_item_categories: categories,
        });
        if (!cancelled) setRequirements(data);
      } catch (e) {
        if (!cancelled) toast.error('Could not load document requirements.');
      }
    }
    fetchReq();
    return () => {
      cancelled = true;
    };
  }, [sellerType, categories]);

  const toggleCategory = (value) => {
    setCategories((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        seller_type: sellerType,
        intended_item_categories: categories,
        ...details,
        payout_details: payout,
      };

      const { data } = await sellersApi.createApplication(payload);
      const appId = data.id;

      const required = requirements.required_document_types || [];
      for (const docType of required) {
        await sellersApi.uploadDocument(appId, { document_type: docType, file: docs[docType] });
      }

      toast.success('Seller application submitted.');
      navigate('/dashboard/seller-application');
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.detail || (typeof data === 'object' ? Object.values(data).flat().join(', ') : null) || 'Submit failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isVerifiedSeller) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="text-2xl font-black tracking-tight text-white">You’re already a verified seller</div>
          <p className="mt-2 text-sm text-slate-300">Go to your seller dashboard to create and manage auctions.</p>
          <div className="mt-4 flex gap-2">
            <Link className="btn btn-primary" to="/dashboard/seller">
              Seller Dashboard
            </Link>
            <Link className="btn btn-ghost" to="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-xs font-semibold text-slate-400">Become a Seller</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-white">Seller verification application</div>
        <p className="mt-2 text-sm text-slate-300">
          Upload required documents based on your <span className="font-semibold text-slate-100">seller type</span> and{' '}
          <span className="font-semibold text-slate-100">item category</span>.
        </p>
      </div>

      <Stepper step={step} />

      {step === 0 && (
        <div className="card p-6">
          <div className="text-sm font-black text-white">Select seller type</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {SELLER_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSellerType(t.value)}
                className={[
                  'card p-4 text-left transition hover:bg-white/10',
                  sellerType === t.value ? 'ring-1 ring-indigo-500/60' : 'ring-1 ring-white/10',
                ].join(' ')}
              >
                <div className="text-sm font-black text-white">{t.label}</div>
                <div className="mt-1 text-xs text-slate-400">Verification requirements will adjust automatically.</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card p-6">
          <div className="text-sm font-black text-white">Basic details</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-300">Full name / business name</label>
              <input
                className="input mt-2 h-11"
                value={details.full_name_or_business_name}
                onChange={(e) => setDetails((d) => ({ ...d, full_name_or_business_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Phone</label>
              <input
                className="input mt-2 h-11"
                value={details.phone}
                onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Email</label>
              <input
                className="input mt-2 h-11"
                value={details.email}
                onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">City</label>
              <input
                className="input mt-2 h-11"
                value={details.city}
                onChange={(e) => setDetails((d) => ({ ...d, city: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Address</label>
              <textarea
                className="input mt-2 min-h-24 resize-y py-3"
                value={details.address}
                onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6">
          <div className="text-sm font-black text-white">Select item categories you plan to sell</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ITEM_CATEGORIES.map((c) => {
              const active = categories.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleCategory(c.value)}
                  className={[
                    'card p-4 text-left transition hover:bg-white/10',
                    active ? 'ring-1 ring-indigo-500/60' : 'ring-1 ring-white/10',
                  ].join(' ')}
                >
                  <div className="text-sm font-black text-white">{c.label}</div>
                  <div className="mt-1 text-xs text-slate-400">Adds category-specific documents.</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black text-white">Upload documents</div>
              <div className="mt-1 text-xs text-slate-400">
                Required docs are enforced by the backend before approval.
              </div>
            </div>
            <Link className="btn btn-ghost" to="/dashboard/seller-application">
              View my application status
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(requirements.required_document_types || []).map((docType) => (
              <div key={docType} className="card p-4 ring-1 ring-white/10">
                <div className="text-sm font-black text-white">{DOC_LABELS[docType] || docType}</div>
                <div className="mt-2">
                  <input
                    type="file"
                    className="text-sm text-slate-300"
                    onChange={(e) => setDocs((d) => ({ ...d, [docType]: e.target.files?.[0] }))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card p-6">
          <div className="text-sm font-black text-white">Payout details</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-300">Preferred payout method</label>
              <select
                className="input mt-2 h-11"
                value={payout.preferred_method}
                onChange={(e) => setPayout((p) => ({ ...p, preferred_method: e.target.value }))}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="esewa">eSewa</option>
                <option value="khalti">Khalti</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Account name</label>
              <input
                className="input mt-2 h-11"
                value={payout.account_name}
                onChange={(e) => setPayout((p) => ({ ...p, account_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Identifier (phone/email/account)</label>
              <input
                className="input mt-2 h-11"
                value={payout.identifier}
                onChange={(e) => setPayout((p) => ({ ...p, identifier: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Provider (optional)</label>
              <input
                className="input mt-2 h-11"
                value={payout.provider}
                onChange={(e) => setPayout((p) => ({ ...p, provider: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card p-6">
          <div className="text-sm font-black text-white">Review</div>
          <div className="mt-4 grid gap-3 text-sm text-slate-200">
            <div className="card p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-slate-400">Seller type</div>
              <div className="mt-1 font-bold text-white">{sellerType}</div>
            </div>
            <div className="card p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-slate-400">Categories</div>
              <div className="mt-1 font-bold text-white">{categories.join(', ')}</div>
            </div>
            <div className="card p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-slate-400">Required documents</div>
              <div className="mt-1 font-bold text-white">{(requirements.required_document_types || []).join(', ')}</div>
            </div>
          </div>

          <button className="btn btn-primary mt-4 h-11" type="button" onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button className="btn btn-ghost" type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setStep((s) => Math.min(5, s + 1))}
          disabled={!canProceed || step === 5}
        >
          Next
        </button>
      </div>
    </div>
  );
}

