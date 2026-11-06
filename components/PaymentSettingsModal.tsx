'use client';

import React, { useState, useEffect } from 'react';
import { PaymentConfig } from '@/lib/types';
import {
  CreditCard,
  DollarSign,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  Copy,
  Check,
} from 'lucide-react';

interface PaymentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
}

export function PaymentSettingsModal({
  isOpen,
  onClose,
  canEdit = true,
}: PaymentSettingsModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [paypalUrl, setPaypalUrl] = useState('');
  const [stripeLink, setStripeLink] = useState('');
  const [tebexUrl, setTebexUrl] = useState('');
  const [cryptoUsdt, setCryptoUsdt] = useState('');
  const [cryptoBtc, setCryptoBtc] = useState('');
  const [bankInfo, setBankInfo] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    async function load() {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      try {
        const res = await fetch('/api/admin/payments');
        if (res.ok) {
          const data = await res.json();
          if (active && data.success && data.config) {
            setPaypalUrl(data.config.paypal_url || '');
            setStripeLink(data.config.stripe_payment_link || '');
            setTebexUrl(data.config.tebex_store_url || '');
            setCryptoUsdt(data.config.crypto_wallet_usdt || '');
            setCryptoBtc(data.config.crypto_wallet_btc || '');
            setBankInfo(data.config.bank_transfer_info || '');
          }
        }
      } catch (err) {
        console.error('Error cargando pasarelas:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypal_url: paypalUrl.trim(),
          stripe_payment_link: stripeLink.trim(),
          tebex_store_url: tebexUrl.trim(),
          crypto_wallet_usdt: cryptoUsdt.trim(),
          crypto_wallet_btc: cryptoBtc.trim(),
          bank_transfer_info: bankInfo.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar configuración de pagos');
      }

      setSuccessMsg('¡URLs y pasarelas de pago actualizadas exitosamente!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#120A21] border border-[#261442] rounded-3xl shadow-[0_0_50px_rgba(192,132,252,0.25)] p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#261442] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Configuración de Pasarelas & URLs de Pago</span>
              </h2>
              <p className="text-xs text-purple-300/70">
                Define dónde y cómo recibirás los pagos de tus clientes (PayPal, Stripe, Tebex y Cripto)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-400 hover:text-white bg-[#08050E] border border-[#261442] hover:bg-[#261442] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-purple-300 font-mono flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#C084FC]" />
            <span>Cargando pasarelas activas...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. PayPal URL */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-blue-950/80 text-[#0079C1] flex items-center justify-center font-black text-xs">
                    P
                  </span>
                  <span>Enlace de Cobro PayPal (PayPal.Me)</span>
                </label>
                {paypalUrl && (
                  <button
                    type="button"
                    onClick={() => handleCopy(paypalUrl, 'paypal')}
                    className="text-[11px] font-mono text-purple-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'paypal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'paypal' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                )}
              </div>
              <input
                type="url"
                disabled={!canEdit}
                value={paypalUrl}
                onChange={(e) => setPaypalUrl(e.target.value)}
                placeholder="https://paypal.me/TuUsuarioStudio"
                className="w-full px-3.5 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
              />
              <p className="text-[11px] text-purple-300/60">
                Tus clientes podrán hacer clic directamente en este link para pagar vía PayPal.
              </p>
            </div>

            {/* 2. Stripe Payment Link */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#C084FC]" />
                  <span>Stripe Payment Link (Tarjeta de Crédito / Débito)</span>
                </label>
                {stripeLink && (
                  <button
                    type="button"
                    onClick={() => handleCopy(stripeLink, 'stripe')}
                    className="text-[11px] font-mono text-purple-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'stripe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'stripe' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                )}
              </div>
              <input
                type="url"
                disabled={!canEdit}
                value={stripeLink}
                onChange={(e) => setStripeLink(e.target.value)}
                placeholder="https://buy.stripe.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
              />
              <p className="text-[11px] text-purple-300/60">
                Crea un Payment Link en tu panel de Stripe y pégalo aquí para procesar Visa, Mastercard y Google Pay.
              </p>
            </div>

            {/* 3. Tebex Store URL */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Tienda Tebex / CraftingStore (Servidores Minecraft)</span>
                </label>
                {tebexUrl && (
                  <button
                    type="button"
                    onClick={() => handleCopy(tebexUrl, 'tebex')}
                    className="text-[11px] font-mono text-purple-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'tebex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'tebex' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                )}
              </div>
              <input
                type="url"
                disabled={!canEdit}
                value={tebexUrl}
                onChange={(e) => setTebexUrl(e.target.value)}
                placeholder="https://tu-estudio.tebex.io"
                className="w-full px-3.5 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
              />
              <p className="text-[11px] text-purple-300/60">
                Ideal para recibir cobros en monedas locales mediante la infraestructura de Tebex Gaming.
              </p>
            </div>

            {/* 4. Criptomonedas (USDT & BTC) */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] space-y-3">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Direcciones de Billeteras Cripto</span>
              </label>

              <div>
                <div className="flex items-center justify-between text-[11px] text-purple-300 font-mono mb-1">
                  <span>USDT (TRC-20 / BEP-20 / Solana)</span>
                  {cryptoUsdt && (
                    <button
                      type="button"
                      onClick={() => handleCopy(cryptoUsdt, 'usdt')}
                      className="text-purple-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'usdt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'usdt' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={cryptoUsdt}
                  onChange={(e) => setCryptoUsdt(e.target.value)}
                  placeholder="TFk8... (Red TRC20) o 0x... (Red BEP20)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-purple-300 font-mono mb-1">
                  <span>Bitcoin (BTC)</span>
                  {cryptoBtc && (
                    <button
                      type="button"
                      onClick={() => handleCopy(cryptoBtc, 'btc')}
                      className="text-purple-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'btc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'btc' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={cryptoBtc}
                  onChange={(e) => setCryptoBtc(e.target.value)}
                  placeholder="bc1q... (Native SegWit)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
                />
              </div>
            </div>

            {/* 5. Transferencia Bancaria Local / Otros */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Datos de Transferencia Bancaria Local / Binance Pay</span>
              </label>
              <textarea
                rows={2}
                disabled={!canEdit}
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                placeholder="Ej: Binance Pay ID: 12345678 · CBU / Alias / Bizum: ..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#261442] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-purple-300 hover:text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>

              {canEdit && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar URLs de Pago</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
