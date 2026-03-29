import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../shared/context/AuthContext';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';

const LOW_STOCK_THRESHOLD = 5;

type InventoryItem = {
  id: string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active: boolean;
};

type InventoryRowData = {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onToggle: (item: InventoryItem) => void;
};

function InventoryRow({ index, style, data }: ListChildComponentProps<InventoryRowData & { isOwner: boolean }>) {
  const item = data.items[index];
  return (
    <div style={style} className="px-1">
      <div className="app-card-soft flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-muted">SKU: {item.sku || 'N/A'}</p>
          <p className="text-xs text-muted">Categoria: {item.category}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-ink">$ {item.price}</p>
          <p className={`text-xs ${item.stock <= LOW_STOCK_THRESHOLD ? 'text-secondary' : 'text-muted'}`}>
            Stock: {item.stock}
          </p>
          <div className="mt-2 flex items-center justify-end gap-2">
            {data.isOwner && (
              <>
                <button className="btn-ghost" type="button" onClick={() => data.onEdit(item)}>
                  Editar
                </button>
                <button className="btn-ghost" type="button" onClick={() => data.onToggle(item)}>
                  {item.active ? 'Desactivar' : 'Activar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  price: 0,
  stock: 0,
  imageUrl: '',
  active: true
};

export function AdminInventoryPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'ADMIN' || user?.role === 'GOD' || user?.role === 'OWNER';
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: () => apiRequest<InventoryItem[]>('/inventory')
  });

  const inventoryItems = inventoryQuery.data || [];
  const shouldVirtualize = inventoryItems.length > 100;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const lowStock = useMemo(
    () => (inventoryQuery.data || []).filter((item) => item.stock <= LOW_STOCK_THRESHOLD),
    [inventoryQuery.data]
  );

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setActionError(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      sku: item.sku || '',
      category: item.category,
      price: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl || '',
      active: item.active
    });
    setActionError(null);
    setImagePreview(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setActionError(null);
    setImagePreview('');
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await apiRequest<{ url: string }>('/upload', {
      method: 'POST',
      body: formData
    });
    return result.url;
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setActionError(null);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (err: any) {
      setActionError(err.message || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setActionError(null);
    try {
      if (editingItem) {
        await apiRequest(`/inventory/${editingItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form)
        });
      } else {
        await apiRequest('/inventory', {
          method: 'POST',
          body: JSON.stringify(form)
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      closeModal();
    } catch (err: any) {
      setActionError(err.message || 'No se pudo guardar el producto');
    }
  };

  const toggleItem = async (item: InventoryItem) => {
    setError(null);
    try {
      await apiRequest(`/inventory/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !item.active })
      });
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el producto');
    }
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Panel de inventario</h2>
            <p className="section-subtitle">Controla productos, stock y precios.</p>
          </div>
          {isOwner && (
            <button className="btn-primary" type="button" onClick={openCreate}>
              Nuevo producto
            </button>
          )}
        </div>
      </header>

      {error ? <div className="app-card text-sm text-secondary">{error}</div> : null}

      {lowStock.length > 0 ? (
        <div className="app-card">
          <h3 className="text-lg font-semibold">Alertas de stock bajo</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {lowStock.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className="text-ink">{item.stock} uds</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="app-card">
        <h3 className="text-lg font-semibold">Productos</h3>
        {inventoryQuery.isLoading ? (
          <p className="mt-4 text-sm text-muted">Cargando inventario...</p>
        ) : inventoryQuery.isError ? (
          <p className="mt-4 text-sm text-secondary">No se pudo cargar inventario.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {isMobile ? (
              inventoryItems.map((item) => (
                <div key={item.id} className="app-card-soft flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted">SKU: {item.sku || 'N/A'}</p>
                      <p className="text-xs text-muted">Categoria: {item.category}</p>
                    </div>
                    <span className="text-sm font-semibold">$ {item.price}</span>
                  </div>
                  <p className={`text-xs ${item.stock <= LOW_STOCK_THRESHOLD ? 'text-secondary' : 'text-muted'}`}>
                    Stock: {item.stock}
                  </p>
                  {isOwner && (
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost" type="button" onClick={() => openEdit(item)}>
                        Editar
                      </button>
                      <button className="btn-ghost" type="button" onClick={() => toggleItem(item)}>
                        {item.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : shouldVirtualize ? (
              <FixedSizeList
                height={520}
                itemCount={inventoryItems.length}
                itemSize={120}
                width="100%"
                itemData={{ items: inventoryItems, onEdit: openEdit, onToggle: toggleItem, isOwner }}
              >
                {InventoryRow}
              </FixedSizeList>
            ) : (
              inventoryItems.map((item) => (
                <div key={item.id} className="app-card-soft flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted">SKU: {item.sku || 'N/A'}</p>
                    <p className="text-xs text-muted">Categoria: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink">$ {item.price}</p>
                    <p className={`text-xs ${item.stock <= LOW_STOCK_THRESHOLD ? 'text-secondary' : 'text-muted'}`}>
                      Stock: {item.stock}
                    </p>
                    {isOwner && (
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button className="btn-ghost" type="button" onClick={() => openEdit(item)}>
                          Editar
                        </button>
                        <button className="btn-ghost" type="button" onClick={() => toggleItem(item)}>
                          {item.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="overlay-surface fixed inset-0 z-50 flex items-end justify-center backdrop-blur sm:items-center">
          <form className="app-card w-full space-y-4 rounded-none sm:max-w-lg sm:rounded-2xl" onSubmit={handleSubmit}>
            <div>
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <p className="text-sm text-muted">Define nombre, categoria y stock disponible.</p>
            </div>

            {actionError ? <p className="text-sm text-secondary">{actionError}</p> : null}

            <label className="text-sm">
              Nombre
              <input
                className="input-field mt-2"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm">
              Categoria
              <input
                className="input-field mt-2"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                required
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                SKU
                <input
                  className="input-field mt-2"
                  value={form.sku}
                  onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                />
              </label>
              <div className="space-y-2">
                <label className="text-sm">
                  Subir imagen
                  <input
                    className="input-field mt-2"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-20 w-full rounded-xl object-cover"
                  />
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Precio
                <input
                  className="input-field mt-2"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                  required
                />
              </label>
              <label className="text-sm">
                Stock
                <input
                  className="input-field mt-2"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
                  required
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Activo
            </label>

            <div className="flex flex-wrap justify-end gap-3">
              <button className="btn-ghost" type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn-primary" type="submit">
                {editingItem ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
