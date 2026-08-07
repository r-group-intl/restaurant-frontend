import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import { useDomain } from '../context/DomainContext';

export default function BakeryProductionEntry() {
  const { domain } = useDomain();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/location/kitchen_bakery');
      setRows(res.data?.items || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load bakery production stock');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [domain]);

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Item' },
      { key: 'qty', label: 'Available Qty' },
      { key: 'unit', label: 'Unit', sortable: false }
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h1 className="text-2xl font-bold text-white">Bakery Productio n</h1>
        <p className="text-slate-400 mt-1">
          This stock increases automatically when you run Production Planning for bakery menu items. Bakery KOTs deduct from this stock.
        </p>
      </div>

      <Card title="Bakery Production Stock">
        <div className="flex items-center justify-end mb-3">
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading…</div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            defaultPageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            searchPlaceholder="Search items..."
            emptyMessage="No produced bakery stock available"
          />
        )}
      </Card>
    </div>
  );
}
