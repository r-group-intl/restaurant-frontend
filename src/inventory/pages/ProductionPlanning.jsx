import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import { useDomain } from '../context/DomainContext';

export default function ProductionPlanning() {
  const { domain } = useDomain();

  const [menuItems, setMenuItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    lines: [{ menuItemId: '', plannedQty: 1, producedItemId: '' }],
    notes: ''
  });

  const finishedItems = useMemo(() => {
    const inv = items || [];
    const onlyFinished = inv.filter((i) => i.stockType === 'finished_item');
    return onlyFinished.length ? onlyFinished : inv;
  }, [items]);

  const normalizeName = (value) => (value || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

  const menuById = useMemo(() => new Map((menuItems || []).map((m) => [String(m._id), m])), [menuItems]);
  const itemById = useMemo(() => new Map((items || []).map((it) => [String(it._id), it])), [items]);
  const finishedByName = useMemo(() => {
    const map = new Map();
    for (const it of finishedItems || []) {
      const key = normalizeName(it.name);
      if (key && !map.has(key)) map.set(key, it);
    }
    return map;
  }, [finishedItems]);

  const getAutoProducedItem = (menuItemId) => {
    const menu = menuById.get(String(menuItemId || ''));
    if (!menu) return null;
    return finishedByName.get(normalizeName(menu.name)) || null;
  };

  const ingredientPreview = useMemo(() => {
    const map = new Map();

    for (const line of form.lines || []) {
      const menuItemId = line?.menuItemId;
      const plannedQty = Number(line?.plannedQty);
      if (!menuItemId || !Number.isFinite(plannedQty) || plannedQty <= 0) continue;

      const menu = menuById.get(String(menuItemId));
      const ingredients = menu?.ingredients || [];

      for (const ing of ingredients) {
        const ingredientItemId = String(ing?.itemId?._id || ing?.itemId || '');
        if (!ingredientItemId) continue;

        const recipeQtyPer1 = Number(ing?.quantity) || 0;
        const recipeUnit = ing?.unit || '';
        const stockUnit = ing?.stockUnit || itemById.get(ingredientItemId)?.unit || recipeUnit;
        const ratio = Number(ing?.conversionRatio) || (recipeUnit && stockUnit && recipeUnit === stockUnit ? 1 : 0);

        const recipeQty = recipeQtyPer1 * plannedQty;
        const stockQty = ratio > 0 ? recipeQty * ratio : recipeQty;

        const existing = map.get(ingredientItemId);
        if (existing) {
          existing.stockQty += stockQty;
          existing.recipeQty += recipeQty;
        } else {
          map.set(ingredientItemId, {
            itemId: ingredientItemId,
            name: ing?.itemName || itemById.get(ingredientItemId)?.name || 'Item',
            stockQty,
            stockUnit: stockUnit || '',
            recipeQty,
            recipeUnit: recipeUnit || ''
          });
        }
      }
    }

    const round3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;
    return Array.from(map.values())
      .map((r) => ({
        ...r,
        stockQty: round3(r.stockQty),
        recipeQty: round3(r.recipeQty)
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [form.lines, menuById, itemById]);

  const ingredientColumns = useMemo(
    () => [
      { key: 'name', label: 'Ingredient' },
      { key: 'stockQty', label: 'Qty to Issue (Main)' },
      { key: 'stockUnit', label: 'Unit', sortable: false }
    ],
    []
  );

  const addLine = () => {
    setForm((p) => ({ ...p, lines: [...(p.lines || []), { menuItemId: '', plannedQty: 1, producedItemId: '' }] }));
  };

  const removeLine = (index) => {
    setForm((p) => {
      const next = (p.lines || []).filter((_, i) => i !== index);
      return { ...p, lines: next.length ? next : [{ menuItemId: '', plannedQty: 1, producedItemId: '' }] };
    });
  };

  const onLineChange = (index, patch) => {
    setForm((p) => {
      const next = [...(p.lines || [])];
      next[index] = { ...next[index], ...patch };
      return { ...p, lines: next };
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [menuRes, itemsRes] = await Promise.all([
          api.get('/menu-items'),
          api.get('/items?itemType=inventory')
        ]);
        setMenuItems(menuRes.data || []);
        setItems(itemsRes.data || []);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [domain]);

  const submit = async (e) => {
    e.preventDefault();

    const lines = (form.lines || [])
      .map((l) => {
        const menuItemId = l.menuItemId;
        const plannedQty = Number(l.plannedQty);

        const selectedProducedItemId = l.producedItemId || undefined;
        const autoProduced = !selectedProducedItemId ? getAutoProducedItem(menuItemId) : null;
        const producedItemId = selectedProducedItemId || autoProduced?._id;

        return {
          menuItemId,
          plannedQty,
          producedItemId
        };
      })
      .filter((l) => l.menuItemId);

    if (lines.length === 0) return toast.error('Select at least one menu item');
    for (const l of lines) {
      if (!Number.isFinite(l.plannedQty) || l.plannedQty <= 0) return toast.error('All planned qty values must be > 0');
    }

    // Note: producedItemId can be resolved server-side via Recipe.producedItemId (preferred) or fallback matching.

    try {
      setSubmitting(true);
      const res = await api.post('/inventory/issue-by-recipe', {
        items: lines,
        notes: form.notes
      });

      toast.success('Production planned and stock updated');

      const productionId = res.data?.production?._id;
      const txnId = res.data?.transaction?._id;
      if (productionId) toast.success(`Production: ${productionId}`, { duration: 5000 });
      if (txnId) toast.success(`Txn: ${txnId}`, { duration: 5000 });

      setForm((p) => ({ ...p, lines: [{ menuItemId: '', plannedQty: 1, producedItemId: '' }], notes: '' }));
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to run production planning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h1 className="text-2xl font-bold text-white">Issue by Recipe (Production Planning)</h1>
        <p className="text-slate-400 mt-1">
          Deducts ingredients from Main Inventory and adds finished stock to Bakery.
        </p>
      </div>

      <Card title="Production Planning">
        {loading ? (
          <div className="text-slate-300">Loading…</div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-300">Menu Items to Produce</div>
                <button
                  type="button"
                  onClick={addLine}
                  className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white"
                >
                  + Add Menu Item
                </button>
              </div>

              {(form.lines || []).map((line, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Menu Item</label>
                    <select
                      className="form-select"
                      value={line.menuItemId}
                      onChange={(e) => onLineChange(idx, { menuItemId: e.target.value })}
                    >
                      <option value="">Select menu item…</option>
                      {menuItems.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.category})
                        </option>
                      ))}
                    </select>
                    {line.menuItemId && (
                      <div className="mt-1 text-xs text-slate-500">
                        Ingredients count: {menuItems.find((m) => m._id === line.menuItemId)?.ingredients?.length || 0}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Planned Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      value={line.plannedQty}
                      onChange={(e) => onLineChange(idx, { plannedQty: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Produced Item (optional)</label>
                    <select
                      className="form-select"
                      value={line.producedItemId}
                      onChange={(e) => onLineChange(idx, { producedItemId: e.target.value })}
                    >
                      <option value="">Auto (Recipe mapping)</option>
                      {finishedItems.map((it) => (
                        <option key={it._id} value={it._id}>
                          {it.name} {it.stockType === 'finished_item' ? '(finished)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-slate-500">
                      {line.producedItemId ? (
                        <>Selected: {itemById.get(String(line.producedItemId))?.name || '—'}</>
                      ) : (
                        (() => {
                          const auto = getAutoProducedItem(line.menuItemId);
                          return auto ? (
                            <>Auto match: {auto.name}</>
                          ) : (
                            <>Auto match: Not found (server will resolve/create produced item)</>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-1 flex md:items-end">
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="w-full md:w-auto px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes (optional)</label>
              <input
                type="text"
                className="form-input"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g., Tomorrow morning bake"
              />
              <div className="mt-1 text-xs text-slate-500">
                Produced stock is added to Bakery (production section). Bakery KOTs will deduct from Bakery stock (not ingredients).
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
              >
                {submitting ? 'Processing…' : 'Run Production Planning'}
              </button>
            </div>
          </form>
        )}
      </Card>

      <Card title="Ingredients to Issue (Main)">
        <p className="text-slate-400 text-sm mb-3">
          This preview shows the total ingredients required for the selected menu items and planned quantities.
        </p>
        <DataTable
          data={ingredientPreview}
          columns={ingredientColumns}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          searchPlaceholder="Search ingredients..."
          emptyMessage="Select menu items to see ingredient requirements"
        />
      </Card>
    </div>
  );
}
