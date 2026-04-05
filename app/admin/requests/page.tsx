'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, FileText, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentRequest, DOCUMENT_TYPE_LABELS, STATUS_CONFIG, RequestStatus } from '@/types';
import { formatTimeAgo } from '@/lib/utils';

const STATUSES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready for Release' },
  { value: 'released', label: 'Released' },
  { value: 'rejected', label: 'Rejected' },
];

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`/api/requests?${params}`);
      const json = await res.json();
      setRequests(json.data || []);
      setTotal(json.count || 0);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { setPage(1); }, [status, search]);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'all') params.delete('status');
    else params.set('status', val);
    router.push(`/admin/requests?${params.toString()}`);
  };

  const statusVariantMap: Record<RequestStatus, 'pending' | 'processing' | 'ready' | 'released' | 'rejected'> = {
    pending: 'pending', processing: 'processing', ready: 'ready',
    released: 'released', rejected: 'rejected',
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up stagger-1">
        <div>
          <h1 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--navy)' }}>Document Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up stagger-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or control number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status quick filters */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-up stagger-3">
        {STATUSES.map(s => (
          <button key={s.value}
            onClick={() => handleStatusChange(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              status === s.value
                ? 'text-white border-transparent'
                : 'text-slate-600 border-slate-200 bg-white hover:border-[#0F2D5E]'
            }`}
            style={status === s.value ? { background: 'var(--navy)' } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-up stagger-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No requests found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Control No.', 'Resident', 'Document Type', 'Purpose', 'Status', 'Submitted', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--navy)' }}>
                        {req.priority && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 mb-0.5"></span>}
                        {req.control_number}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {req.residents?.last_name}, {req.residents?.first_name}
                        </p>
                        <p className="text-xs text-slate-400">{req.residents?.contact_number}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{DOCUMENT_TYPE_LABELS[req.document_type]}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate" title={req.purpose}>{req.purpose}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariantMap[req.status]}>
                          <span className={`status-dot ${req.status} mr-1.5`}></span>
                          {STATUS_CONFIG[req.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatTimeAgo(req.created_at)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/requests/${req.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--navy)' }}>
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {requests.map((req) => (
                <Link key={req.id} href={`/admin/requests/${req.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                  <span className={`status-dot ${req.status} shrink-0`}></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {req.residents?.first_name} {req.residents?.last_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{DOCUMENT_TYPE_LABELS[req.document_type]}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--navy)' }}>{req.control_number}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={statusVariantMap[req.status]} className="text-xs mb-1">
                      {STATUS_CONFIG[req.status].label}
                    </Badge>
                    <p className="text-xs text-slate-400">{formatTimeAgo(req.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</Button>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
