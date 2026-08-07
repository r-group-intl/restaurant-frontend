import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { getImageUrl } from '../../utils/imageUtils';

export default function SpecialOffers() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    badge: '',
    image: '',
    sortOrder: 0,
    startAt: '',
    endAt: '',
    isActive: true,
  });

  const load = async () => {
    const res = await api.get('/special-offers');
    setRows(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', description: '', badge: '', image: '', sortOrder: 0, startAt: '', endAt: '', isActive: true });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const toDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || '',
      subtitle: row.subtitle || '',
      description: row.description || '',
      badge: row.badge || '',
      image: row.image || '',
      sortOrder: Number(row.sortOrder) || 0,
      startAt: toDateTimeLocal(row.startAt),
      endAt: toDateTimeLocal(row.endAt),
      isActive: row.isActive !== false,
    });
    setPreviewUrl(row.image ? getImageUrl(row.image) : '');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setOpen(true);
  };

  const uploadImage = async (file) => {
    const payload = new FormData();
    payload.append('image', file);
    const res = await api.post('/upload/image', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.imageUrl;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setForm((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const save = async () => {
    if (!form.title?.trim()) return;

    try {
      setSaving(true);
      let imageUrl = form.image;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const submit = {
        title: form.title.trim(),
        subtitle: form.subtitle?.trim() || '',
        description: form.description?.trim() || '',
        badge: form.badge?.trim() || '',
        image: imageUrl,
        sortOrder: Number(form.sortOrder) || 0,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
        isActive: Boolean(form.isActive),
      };

      if (editing?._id) {
        await api.put(`/special-offers/${editing._id}`, submit);
      } else {
        await api.post('/special-offers', submit);
      }

      setOpen(false);
      reset();
      await load();
    } catch (error) {
      console.error('Error saving special offer:', error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Error saving offer.';
      alert(status ? `Error (${status}): ${message}` : message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!row?._id) return;
    if (!confirm('Delete this special offer?')) return;
    try {
      await api.delete(`/special-offers/${row._id}`);
      await load();
    } catch (error) {
      console.error('Error deleting special offer:', error);
      alert('Error deleting offer. Please try again.');
    }
  };

  return (
    <Card
      title="Special Offers"
      actions={
        <button className="px-3 py-2 rounded bg-primary-600" onClick={openCreate} type="button">
          Add
        </button>
      }
    >
      <div className="text-sm text-muted-foreground mb-4">
        Offers shown as banners on the customer website (only active + within date range).
      </div>

      <Table
        columns={[
          { key: 'title', title: 'Title' },
          {
            key: 'image',
            title: 'Image',
            render: (_, row) => (
              row.image ? (
                <img
                  src={getImageUrl(row.image)}
                  alt={row.title}
                  className="w-16 h-10 rounded-lg object-cover border border-slate-700"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span className="text-slate-400 text-xs">—</span>
              )
            )
          },
          { key: 'sortOrder', title: 'Sort' },
          {
            key: 'isActive',
            title: 'Active',
            render: (value) => (
              <span className={`text-xs px-2 py-1 rounded ${value ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
                {value ? 'Yes' : 'No'}
              </span>
            ),
          },
          {
            key: 'actions',
            title: 'Actions',
            render: (_, row) => (
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600" type="button" onClick={() => openEdit(row)}>
                  Edit
                </button>
                <button className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700" type="button" onClick={() => remove(row)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        data={rows}
        empty="No special offers yet"
      />

      <Modal open={open} title={editing ? 'Edit Special Offer' : 'Add Special Offer'} onClose={() => { setOpen(false); reset(); }} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Weekend Combo Offer"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Subtitle</label>
            <input
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 min-h-[96px]"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Offer details"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Badge</label>
              <input
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                value={form.badge}
                onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                placeholder="e.g., 20% OFF"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sort Order</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start (optional)</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                value={form.startAt}
                onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">End (optional)</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                value={form.endAt}
                onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="offer-active"
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            <label htmlFor="offer-active" className="text-sm text-slate-300">Active</label>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Image</label>

            {previewUrl ? (
              <div className="mb-3">
                <img src={previewUrl} alt="Preview" className="w-full max-w-2xl h-44 object-cover rounded-xl border border-slate-700" />
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="w-full text-sm text-slate-300"
                onChange={handleFileSelect}
              />
              <input
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="Or paste image URL/path (optional)"
              />
              <div>
                <button className="px-3 py-2 rounded bg-slate-700" type="button" onClick={removeSelectedImage}>
                  Remove Image
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded bg-slate-700" onClick={() => { setOpen(false); reset(); }} type="button">Cancel</button>
            <button
              className="px-3 py-2 rounded bg-primary-600 disabled:opacity-60"
              onClick={save}
              type="button"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
