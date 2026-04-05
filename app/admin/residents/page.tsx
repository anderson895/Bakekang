'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Users, Loader2, MapPin, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Resident } from '@/types';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function ResidentsPage() {
  const [residents, setResidents] = useState<(Resident & { request_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('residents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,contact_number.ilike.%${search}%`);
    }

    const { data } = await query;
    if (data) {
      // Fetch request counts
      const supabase2 = createClient();
      const withCounts = await Promise.all(data.map(async (r) => {
        const { count } = await supabase2.from('document_requests').select('id', { count: 'exact', head: true }).eq('resident_id', r.id);
        return { ...r, request_count: count || 0 };
      }));
      setResidents(withCounts);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchResidents, 300);
    return () => clearTimeout(timer);
  }, [fetchResidents]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-up stagger-1">
        <h1 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--navy)' }}>Residents</h1>
        <p className="text-slate-500 text-sm mt-1">{residents.length} registered residents</p>
      </div>

      <div className="relative mb-6 animate-fade-up stagger-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name or contact number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : residents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No residents found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up stagger-3">
          {residents.map((resident) => (
            <div key={resident.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                  style={{ background: 'var(--navy)' }}>
                  {resident.first_name[0]}{resident.last_name[0]}
                </div>
                <Badge variant="outline" className="text-xs">
                  {resident.request_count} request{resident.request_count !== 1 ? 's' : ''}
                </Badge>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">
                {resident.first_name} {resident.middle_name ? `${resident.middle_name[0]}. ` : ''}{resident.last_name}
              </h3>
              {resident.date_of_birth && (
                <p className="text-xs text-slate-400 mb-2">Born {formatDate(resident.date_of_birth)}</p>
              )}
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{resident.address}{resident.purok ? ` — ${resident.purok}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{resident.contact_number}</span>
                </div>
                {resident.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{resident.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
