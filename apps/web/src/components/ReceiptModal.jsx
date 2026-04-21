
import React, { useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, X } from 'lucide-react';

/**
 * ReceiptModal — shows a printable/downloadable receipt
 *
 * Props:
 *   open        : boolean
 *   onClose     : () => void
 *   receipt     : {
 *     id, ref, date, service, studentName, studentEmail,
 *     items: [{ label, qty, unitPrice }],
 *     total, status, paymentMethod
 *   }
 *   companyName : string  (e.g. "IWS – Centre de Formation")
 */
const ReceiptModal = ({ open, onClose, receipt, companyName = 'IWS Smart Platform' }) => {
  const printRef = useRef();

  if (!receipt) return null;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>Reçu #${receipt.ref || receipt.id?.slice(0,8).toUpperCase()}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; padding: 20px; }
        .receipt { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
        .header { background: linear-gradient(135deg,#1e40af,#3b82f6); color: #fff; padding: 32px 36px; }
        .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
        .subtitle { font-size: 13px; opacity: .8; }
        .receipt-title { margin-top: 20px; font-size: 28px; font-weight: 700; letter-spacing: -1px; }
        .ref { font-size: 13px; opacity: .75; margin-top: 4px; }
        .body { padding: 32px 36px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .meta-block label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; color: #6b7280; margin-bottom: 4px; display: block; }
        .meta-block p { font-size: 14px; color: #111827; font-weight: 500; }
        .status { display: inline-flex; align-items: center; gap: 6px; padding: 3px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .7px; color: #6b7280; padding: 10px 12px; border-bottom: 2px solid #e5e7eb; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
        tr:last-child td { border-bottom: none; }
        .total-row { background: #f0f9ff; }
        .total-row td { font-size: 15px; font-weight: 700; color: #1e40af; padding: 14px 12px; }
        .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
        @media print {
          body { background: #fff; padding: 0; }
          .receipt { box-shadow: none; border-radius: 0; }
        }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const statusClass = receipt.status === 'paid'
    ? 'status-paid'
    : receipt.status === 'cancelled'
    ? 'status-cancelled'
    : 'status-pending';

  const statusLabel = receipt.status === 'paid' ? '✓ Payé'
    : receipt.status === 'cancelled' ? '✕ Annulé'
    : '⏳ En attente';

  const subtotal = (receipt.items || []).reduce((s, i) => s + ((i.qty || 1) * (i.unitPrice || 0)), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              Reçu #{receipt.ref || receipt.id?.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2 text-xs">
              <Printer className="w-3.5 h-3.5" />
              Imprimer / PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="w-8 h-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Receipt preview */}
        <div className="p-4 sm:p-6">
          <div ref={printRef}>
            <div className="receipt max-w-full border border-border rounded-xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="header bg-gradient-to-br from-blue-700 to-blue-500 text-white p-7">
                <div className="logo">{companyName}</div>
                <div className="subtitle">Reçu de paiement officiel</div>
                <div className="receipt-title">Reçu</div>
                <div className="ref">
                  #{receipt.ref || receipt.id?.slice(0, 8).toUpperCase()} &nbsp;·&nbsp;
                  {new Date(receipt.date || Date.now()).toLocaleDateString('fr-FR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </div>
              </div>

              {/* Body */}
              <div className="body p-7 bg-white">
                {/* Meta */}
                <div className="meta-grid grid grid-cols-2 gap-5 mb-7">
                  <div className="meta-block">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">Émis à</label>
                    <p className="font-semibold text-foreground">{receipt.studentName || '—'}</p>
                    <p className="text-sm text-muted-foreground">{receipt.studentEmail || ''}</p>
                  </div>
                  <div className="meta-block">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">Service</label>
                    <p className="font-semibold text-foreground">{receipt.service || '—'}</p>
                    <span className={`mt-1 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                      receipt.status === 'paid' ? 'bg-green-100 text-green-700' :
                      receipt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                  {receipt.paymentMethod && (
                    <div className="meta-block">
                      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">Moyen de paiement</label>
                      <p className="font-semibold text-foreground capitalize">{receipt.paymentMethod}</p>
                    </div>
                  )}
                  <div className="meta-block">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">Date</label>
                    <p className="font-semibold text-foreground">
                      {new Date(receipt.date || Date.now()).toLocaleDateString('fr-FR', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Items table */}
                <table className="w-full text-sm border-collapse mb-4">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Description</th>
                      <th className="text-center py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Qté</th>
                      <th className="text-right py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Prix unit.</th>
                      <th className="text-right py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(receipt.items || [{ label: 'Formation', qty: 1, unitPrice: receipt.total }]).map((item, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 text-foreground">{item.label}</td>
                        <td className="py-3 text-center text-muted-foreground">{item.qty || 1}</td>
                        <td className="py-3 text-right text-muted-foreground">{(item.unitPrice || 0).toLocaleString('fr-FR')} MAD</td>
                        <td className="py-3 text-right font-semibold text-foreground">{((item.qty || 1) * (item.unitPrice || 0)).toLocaleString('fr-FR')} MAD</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 dark:bg-blue-950/30">
                      <td colSpan={3} className="py-3 px-2 text-right font-bold text-blue-700 dark:text-blue-300 text-base">
                        Total TTC
                      </td>
                      <td className="py-3 text-right font-bold text-blue-700 dark:text-blue-300 text-lg">
                        {(receipt.total || 0).toLocaleString('fr-FR')} MAD
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer note */}
                <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
                  <span>Ce reçu a été généré automatiquement par IWS Smart Platform.</span>
                  <span>Merci pour votre confiance !</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
