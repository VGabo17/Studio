'use client';

import React, { useState, useEffect } from 'react';
import { PaymentConfig, PaymentGateway, Project } from '@/lib/types';
import {
  X,
  CreditCard,
  CheckCircle2,
  Lock,
  Shield,
  Zap,
  Sparkles,
  Loader2,
  ExternalLink,
  DollarSign,
  Receipt,
  Download,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface GamerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onPaymentSuccess: (updatedProject: Project) => void;
}

export function GamerCheckoutModal({
  isOpen,
  onClose,
  project,
  onPaymentSuccess,
}: GamerCheckoutModalProps) {
  const totalPrice = project.price || 0;
  const currentPaid = project.paid_amount || 0;
  const halfPrice = Math.round((totalPrice / 2) * 100) / 100;
  const remainingPrice = Math.max(0, Math.round((totalPrice - currentPaid) * 100) / 100);

  const isDepositAlreadyPaid = project.payment_status === 'deposit_paid';

  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>(
    isDepositAlreadyPaid ? 'full' : 'full'
  );
  const [gateway, setGateway] = useState<PaymentGateway>('stripe');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cryptoCoin, setCryptoCoin] = useState<'USDT' | 'LTC' | 'BTC'>('USDT');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadConfig() {
      try {
        const res = await fetch('/api/admin/payments');
        if (res.ok) {
          const data = await res.json();
          if (active && data.success && data.config) {
            setPaymentConfig(data.config);
          }
        }
      } catch (err) {
        console.error('Error cargando pasarelas:', err);
      }
    }
    loadConfig();
    return () => {
      active = false;
    };
  }, []);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };
  const [receipt, setReceipt] = useState<{
    transaction_id: string;
    amount_paid: number;
    payment_method: string;
    paid_at: string;
    deliveries_unlocked: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const amountToCharge = paymentType === 'deposit' && !isDepositAlreadyPaid ? halfPrice : remainingPrice;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: paymentType,
          gateway,
          clientNotes: `Pago procesado vía ${gateway.toUpperCase()} por el cliente.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      setReceipt(data.receipt);
      onPaymentSuccess(data.project);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#120A21] border border-[#261442] rounded-3xl shadow-[0_0_60px_rgba(192,132,252,0.3)] p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#261442] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Pasarela de Pago Gamer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-semibold">
                  SSL SHA-256
                </span>
              </h2>
              <p className="text-xs text-purple-300/70">
                Pago autónomo y desbloqueo instantáneo de entregas .jar
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

        {receipt ? (
          /* Recibo de Pago Confirmado */
          <div className="py-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Transacción Aprobada
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                ${receipt.amount_paid.toFixed(2)} USD
              </h3>
              <p className="text-xs text-purple-300/70 mt-1">
                Abonados exitosamente para el proyecto <strong>{project.id}</strong>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] text-left text-xs space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-purple-400">N° Transacción:</span>
                <span className="text-white font-bold">{receipt.transaction_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400">Pasarela:</span>
                <span className="text-[#C084FC] font-semibold uppercase">{receipt.payment_method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400">Fecha & Hora:</span>
                <span className="text-purple-200">{new Date(receipt.paid_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#261442]">
                <span className="text-purple-400">Estado de Entregas:</span>
                <span className={`font-bold ${receipt.deliveries_unlocked ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {receipt.deliveries_unlocked ? '🔓 Descargas .jar Desbloqueadas' : '⚡ Anticipo Registrado'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-300 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-[#C084FC]" />
              <span>Se ha enviado un Rich Embed con este recibo a tu Discord.</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all"
            >
              Volver al Proyecto y Descargas
            </button>
          </div>
        ) : (
          /* Formulario de Checkout */
          <form onSubmit={handleProcessPayment} className="space-y-6">
            {/* Project Summary Banner */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#C084FC] font-bold">
                  {project.id}
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-[280px]">
                  {project.title}
                </h4>
                <p className="text-[11px] text-purple-300/60 mt-0.5">
                  Tarifa pactada: ${totalPrice} USD
                </p>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-purple-400">A liquidar hoy:</div>
                <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                  ${amountToCharge.toFixed(2)}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Policy Selector: 50% Anticipo vs 100% Pago Completo */}
            {!isDepositAlreadyPaid ? (
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-2">
                  Modalidad de Pago
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentType === 'full'
                        ? 'bg-[#C084FC]/15 border-[#C084FC] shadow-[0_0_15px_rgba(192,132,252,0.2)]'
                        : 'bg-[#08050E] border-[#261442] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Pago Completo (100%)</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        ${totalPrice} USD
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300/70">
                      Desbloquea de inmediato las descargas de compilaciones .jar y configuraciones.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('deposit')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentType === 'deposit'
                        ? 'bg-[#C084FC]/15 border-[#C084FC] shadow-[0_0_15px_rgba(192,132,252,0.2)]'
                        : 'bg-[#08050E] border-[#261442] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Anticipo 50%</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        ${halfPrice} USD
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300/70">
                      Abona la mitad para iniciar el sprint técnico. Liquidas el resto antes de la entrega final.
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200">
                <span className="font-bold">Anticipo del 50% ya registrado:</span> Estás liquidando el saldo restante de <strong>${remainingPrice.toFixed(2)} USD</strong> para desbloquear las descargas definitivas.
              </div>
            )}

            {/* Gateway Tabs */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-2">
                Selecciona tu Pasarela Gamer
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Stripe */}
                <button
                  type="button"
                  onClick={() => setGateway('stripe')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                    gateway === 'stripe'
                      ? 'bg-purple-950/80 border-[#C084FC] text-white shadow-[0_0_15px_rgba(192,132,252,0.3)]'
                      : 'bg-[#08050E] border-[#261442] text-purple-300/70 hover:text-white hover:border-[#261442]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#C084FC]" />
                  <span className="font-semibold text-[11px]">Tarjeta / Stripe</span>
                </button>

                {/* 2. PayPal */}
                <button
                  type="button"
                  onClick={() => setGateway('paypal')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                    gateway === 'paypal'
                      ? 'bg-blue-950/80 border-blue-400 text-white shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                      : 'bg-[#08050E] border-[#261442] text-purple-300/70 hover:text-white hover:border-[#261442]'
                  }`}
                >
                  <span className="text-base font-extrabold text-[#0079C1]">P</span>
                  <span className="font-semibold text-[11px]">PayPal Gamer</span>
                </button>

                {/* 3. Tebex */}
                <button
                  type="button"
                  onClick={() => setGateway('tebex')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                    gateway === 'tebex'
                      ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                      : 'bg-[#08050E] border-[#261442] text-purple-300/70 hover:text-white hover:border-[#261442]'
                  }`}
                >
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-[11px]">Tebex MC</span>
                </button>

                {/* 4. Crypto */}
                <button
                  type="button"
                  onClick={() => setGateway('crypto')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                    gateway === 'crypto'
                      ? 'bg-amber-950/80 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : 'bg-[#08050E] border-[#261442] text-purple-300/70 hover:text-white hover:border-[#261442]'
                  }`}
                >
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-[11px]">Cripto (USDT)</span>
                </button>
              </div>
            </div>

            {/* Gateway Interactive Content */}
            <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] space-y-3">
              {gateway === 'stripe' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-purple-300/80 mb-1">
                      Nombre en la Tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Developer"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-purple-300/80 mb-1">
                      Número de Tarjeta (Simulación Segura)
                    </label>
                    <input
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-purple-300/80 mb-1">
                        Expiración (MM/AA)
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-purple-300/80 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="888"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#120A21] border border-[#261442] focus:border-[#C084FC] text-white text-xs outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {gateway === 'paypal' && (
                <div className="text-center py-3 space-y-3">
                  <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    <span className="text-[#0079C1] font-black text-base">P</span>
                    <span>PayPal Checkout & Enlace de Cobro Directo</span>
                  </div>
                  <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
                    Abona <strong>${amountToCharge.toFixed(2)} USD</strong> con protección para compradores y confirmación inmediata.
                  </p>

                  {paymentConfig?.paypal_url && (
                    <div className="p-3 rounded-xl bg-[#120A21] border border-[#261442] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-md mx-auto">
                      <div className="truncate text-left w-full sm:w-auto">
                        <div className="text-[10px] font-mono text-purple-400">Enlace de Pago Oficial:</div>
                        <div className="text-xs font-mono text-white truncate max-w-xs">{paymentConfig.paypal_url}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyText(paymentConfig.paypal_url, 'paypal')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#08050E] border border-[#261442] text-[11px] font-mono text-purple-300 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'paypal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'paypal' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                        <a
                          href={paymentConfig.paypal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#0079C1] hover:bg-[#005ea6] text-white text-xs font-bold flex items-center gap-1"
                        >
                          <span>Abrir PayPal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {gateway === 'tebex' && (
                <div className="text-center py-3 space-y-3">
                  <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Pasarela Oficial Tebex Minecraft</span>
                  </div>
                  <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
                    Compatible con más de 120 métodos de pago internacionales y monedas locales.
                  </p>

                  {paymentConfig?.tebex_store_url && (
                    <div className="p-3 rounded-xl bg-[#120A21] border border-[#261442] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-md mx-auto">
                      <div className="truncate text-left w-full sm:w-auto">
                        <div className="text-[10px] font-mono text-purple-400">Tienda Tebex Vinculada:</div>
                        <div className="text-xs font-mono text-white truncate max-w-xs">{paymentConfig.tebex_store_url}</div>
                      </div>
                      <a
                        href={paymentConfig.tebex_store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1"
                      >
                        <span>Abrir Tienda</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {gateway === 'crypto' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(['USDT', 'LTC', 'BTC'] as const).map((coin) => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setCryptoCoin(coin)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          cryptoCoin === coin
                            ? 'bg-amber-400 text-black'
                            : 'bg-[#120A21] border border-[#261442] text-purple-300'
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    let addr = 'TQn9Y2khEsLJW1ChVWFMSMeSTow5K5gU46 (Red TRC-20)';
                    if (cryptoCoin === 'USDT' && paymentConfig?.crypto_wallet_usdt) {
                      addr = paymentConfig.crypto_wallet_usdt;
                    } else if (cryptoCoin === 'BTC' && paymentConfig?.crypto_wallet_btc) {
                      addr = paymentConfig.crypto_wallet_btc;
                    } else if (cryptoCoin === 'LTC') {
                      addr = 'ltc1q9p82ks01m38x27v92k18a7c29v8xk104 (Litecoin Network)';
                    }
                    return (
                      <div className="p-3.5 rounded-xl bg-[#120A21] border border-[#261442] text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between text-purple-400 text-[10px]">
                          <span>Dirección Oficial de Depósito ({cryptoCoin}):</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(addr, 'crypto')}
                            className="text-purple-300 hover:text-white flex items-center gap-1 text-[11px]"
                          >
                            {copiedKey === 'crypto' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'crypto' ? '¡Copiada!' : 'Copiar'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded-lg bg-black/60 text-[#C084FC] break-all select-all text-xs font-semibold">
                          {addr}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Total Summary & Submit */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-purple-300/70 flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cifrado SSL 256-bit</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#08050E] border border-[#261442] text-xs text-purple-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold transition-all shadow-[0_0_25px_rgba(192,132,252,0.35)] flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando ${amountToCharge.toFixed(2)} USD...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Pagar ${amountToCharge.toFixed(2)} USD</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
