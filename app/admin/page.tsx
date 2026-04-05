import { createClient } from '@/lib/supabase/server';
import { FileText, Clock, Loader, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';
import { DOCUMENT_TYPE_LABELS, STATUS_CONFIG, DocumentRequest } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';

async function getDashboardData() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allReq, todayReq, recentReq, residents] = await Promise.all([
    supabase.from('document_requests').select('status', { count: 'exact' }),
    supabase.from('document_requests').select('id', { count: 'exact' }).gte('created_at', today.toISOString()),
    supabase.from('document_requests')
      .select('*, residents(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('residents').select('id', { count: 'exact' }),
  ]);

  const statuses = allReq.data || [];
  return {
    total: allReq.count || 0,
    pending: statuses.filter(r => r.status === 'pending').length,
    processing: statuses.filter(r => r.status === 'processing').length,
    ready: statuses.filter(r => r.status === 'ready').length,
    released: statuses.filter(r => r.status === 'released').length,
    rejected: statuses.filter(r => r.status === 'rejected').length,
    today: todayReq.count || 0,
    totalResidents: residents.count || 0,
    recent: recentReq.data || [],
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const statCards = [
    { label: 'Total Requests', value: data.total, icon: FileText, color: 'var(--navy)', bg: 'rgba(15,45,94,0.06)' },
    { label: 'Pending', value: data.pending, icon: Clock, color: '#d97706', bg: 'rgba(217,119,6,0.06)' },
    { label: 'Processing', value: data.processing, icon: Loader, color: '#2563eb', bg: 'rgba(37,99,235,0.06)' },
    { label: 'Ready for Release', value: data.ready, icon: CheckCircle, color: '#059669', bg: 'rgba(5,150,105,0.06)' },
    { label: 'Released', value: data.released, icon: TrendingUp, color: '#64748b', bg: 'rgba(100,116,139,0.06)' },
    { label: 'Today\'s Requests', value: data.today, icon: TrendingUp, color: '#F4A900', bg: 'rgba(244,169,0,0.08)' },
    { label: 'Rejected', value: data.rejected, icon: XCircle, color: '#dc2626', bg: 'rgba(220,38,38,0.06)' },
    { label: 'Total Residents', value: data.totalResidents, icon: Users, color: 'var(--navy)', bg: 'rgba(15,45,94,0.06)' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-up stagger-1">
        <h1 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--navy)' }}>Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up stagger-2">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-4.5 h-4.5" style={{ color, width: '18px', height: '18px' }} />
              </div>
              <span className="text-2xl font-bold" style={{ color }}>{value}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions + Recent */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="animate-fade-up stagger-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/requests"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0F2D5E] hover:shadow-sm transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(15,45,94,0.06)' }}>
                <FileText className="w-4.5 h-4.5" style={{ color: 'var(--navy)', width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 group-hover:text-[#0F2D5E]">View All Requests</p>
                <p className="text-xs text-slate-400">{data.pending} pending review</p>
              </div>
            </Link>
            <Link href="/admin/requests?status=ready"
              className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:shadow-sm transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600" style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800">Ready for Release</p>
                <p className="text-xs text-emerald-600">{data.ready} document{data.ready !== 1 ? 's' : ''} waiting</p>
              </div>
            </Link>
            <Link href="/admin/residents"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0F2D5E] hover:shadow-sm transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(15,45,94,0.06)' }}>
                <Users className="w-4.5 h-4.5" style={{ color: 'var(--navy)', width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 group-hover:text-[#0F2D5E]">Manage Residents</p>
                <p className="text-xs text-slate-400">{data.totalResidents} registered</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="md:col-span-2 animate-fade-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Requests</h2>
            <Link href="/admin/requests" className="text-xs font-medium hover:underline" style={{ color: 'var(--navy)' }}>
              View all →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {data.recent.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No requests yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(data.recent as DocumentRequest[]).map((req) => {
                  const sc = STATUS_CONFIG[req.status];
                  return (
                    <Link key={req.id} href={`/admin/requests/${req.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <span className={`status-dot ${req.status}`}></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {req.residents?.first_name} {req.residents?.last_name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{DOCUMENT_TYPE_LABELS[req.document_type]}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-medium ${sc.color}`}>{sc.label}</p>
                        <p className="text-xs text-slate-400">{formatTimeAgo(req.created_at)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
