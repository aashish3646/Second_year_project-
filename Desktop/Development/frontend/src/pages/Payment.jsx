import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { paymentsApi } from '../services/paymentsApi';
import { auctionsApi } from '../services/auctionsApi';

export default function Payment() {
  const { auctionId } = useParams();
  const [method, setMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [auction, setAuction] = useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await auctionsApi.detail(auctionId);
        setAuction(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [auctionId]);

  const initiate = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsApi.initiate({ auction: Number(auctionId), payment_method: method });
      setPayment(data);
      toast.success('Payment initiated');
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-10">
      <div className="card p-6">
        <div className="text-2xl font-black tracking-tight text-white">Payment</div>
        <p className="mt-1 text-sm text-slate-400">
          Initiates payment via <span className="font-semibold text-slate-200">POST /api/payments/initiate</span>.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-slate-300">Auction ID</div>
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100">
              {auctionId}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Payment method</label>
            <select className="input mt-2 h-11" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="stripe">Stripe</option>
              <option value="khalti">Khalti</option>
              <option value="esewa">eSewa</option>
            </select>
          </div>
        </div>

        <button 
          className="btn btn-primary mt-4 h-11" 
          onClick={initiate} 
          disabled={loading || (auction && !new Date(auction.end_time).getTime() < Date.now())}
        >
          {loading ? 'Processing…' : 'Initiate payment'}
        </button>
        
        {auction && new Date(auction.end_time).getTime() > Date.now() && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 uppercase tracking-widest text-center">
            Waiting for auction to end
          </div>
        )}

        {payment && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <div className="font-black text-white">Payment created</div>
            <div className="mt-2 grid gap-1 text-xs text-slate-300">
              <div>
                Payment ID: <span className="font-semibold text-slate-100">{payment.id}</span>
              </div>
              <div>
                Status: <span className="font-semibold text-slate-100">{payment.payment_status}</span>
              </div>
              <div>
                Amount: <span className="font-semibold text-slate-100">{payment.amount}</span>
              </div>
              <div>
                Transaction: <span className="font-semibold text-slate-100">{payment.transaction_id}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

