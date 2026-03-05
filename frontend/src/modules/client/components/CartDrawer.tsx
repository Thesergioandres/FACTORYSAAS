import { useMemo, useState } from 'react';
import { useCart } from '../../../shared/context/CartContext';
import { useTenant } from '../../../shared/context/TenantContext';
import { getBusinessStatus } from '../../../shared/utils/businessHours';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  tenantPhone?: string | null;
};

const formatPhone = (phone?: string | null) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

export function CartDrawer({ isOpen, onClose, tenantPhone }: CartDrawerProps) {
  const { items, addItemOptimistic, removeItem, clearCart, totalAmount } = useCart();
  const { tenant } = useTenant();
  const phone = formatPhone(tenantPhone);
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const { isOpen: isBusinessOpen, nextOpenLabel } = getBusinessStatus(tenant?.businessHours);
  const isCheckoutDisabled = items.length === 0 || !phone || !isBusinessOpen;

  const orderMessage = useMemo(() => {
    const list = items
      .map((item) => `${item.quantity} x ${item.name}`)
      .join(', ');
    const modeLabel = deliveryMode === 'delivery' ? 'Envio a domicilio' : 'Recoger en local';
    const addressLine = deliveryMode === 'delivery' && address.trim()
      ? `\nDIRECCION: ${address.trim()}`
      : '';
    return `Hola, quiero realizar el siguiente pedido: ${list || 'Sin items'}.\nMODALIDAD: ${modeLabel}${addressLine}.\nTotal: $${totalAmount}`;
  }, [items, totalAmount, deliveryMode, address]);

  const whatsappLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(orderMessage)}`
    : '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full border-l border-[#00F0FF] bg-[#0A0F1E]/80 p-6 backdrop-blur-[20px] sm:w-[400px]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Carrito</h3>
          <button className="btn-ghost" type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted">No hay productos en el carrito.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#8A2BE2]/40 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-muted">$ {item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost" type="button" onClick={() => removeItem(item.id)}>
                      -
                    </button>
                    <span className="text-sm text-ink">{item.quantity}</span>
                    <button className="btn-ghost" type="button" onClick={() => addItemOptimistic({ id: item.id, name: item.name, price: item.price })}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-[#00F0FF]/50 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Entrega</p>
          <div className="mt-3 space-y-2 text-sm text-ink">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="deliveryMode"
                checked={deliveryMode === 'pickup'}
                onChange={() => setDeliveryMode('pickup')}
              />
              Recoger en Local
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="deliveryMode"
                checked={deliveryMode === 'delivery'}
                onChange={() => setDeliveryMode('delivery')}
              />
              Envio a Domicilio
            </label>
          </div>
          {deliveryMode === 'delivery' ? (
            <input
              className="input-field mt-3"
              placeholder="Direccion de entrega"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          ) : null}
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total</span>
            <span className="text-ink">$ {totalAmount}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-secondary" type="button" onClick={clearCart} disabled={items.length === 0}>
              Vaciar
            </button>
            <a
              className="btn-primary"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              aria-disabled={isCheckoutDisabled}
              onClick={(event) => {
                if (isCheckoutDisabled) {
                  event.preventDefault();
                }
              }}
            >
              Finalizar compra
            </a>
          </div>
          {!isBusinessOpen ? (
            <p className="mt-3 text-xs text-secondary">
              El establecimiento esta cerrado en este momento. Volvemos el {nextOpenLabel}.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
