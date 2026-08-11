import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { 
  ShoppingBag, 
  Truck, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Download, 
  Thermometer, 
  RefreshCw,
  TrendingUp,
  Plus,
  MapPin
} from 'lucide-react';

interface BuyerPortalDashboardProps {
  buyerUserId?: string;
  onBrowseMarketplace: () => void;
  onInspectTraceability: (lotId: string) => void;
}

export const BuyerPortalDashboard: React.FC<BuyerPortalDashboardProps> = ({
  buyerUserId = 'usr-buyer-01',
  onBrowseMarketplace,
  onInspectTraceability,
}) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'LOGISTICS' | 'INVOICES' | 'REQUESTS' | 'PROFILE'>('ORDERS');

  const buyerProfile = AgriTrustDatabase.getBuyerProfileByUserId(buyerUserId) || {
    id: 'bp-01',
    userId: buyerUserId,
    organisationId: 'org-buyer-01',
    businessName: 'Island Fresh Hospitality Group',
    contactName: 'Sarah Jenkins',
    privatePhone: '+1-555-018-9920',
    privateAddress: '88 Harbour View Boulevard, Suite 400',
    creditLimit: 50000,
    verified: true,
    createdAt: '2026-02-01T09:15:00Z',
  };

  const buyerOrders = AgriTrustDatabase.getBuyerOrders(buyerProfile.id);
  const buyerShipments = AgriTrustDatabase.getBuyerShipments(buyerProfile.id);
  const buyerInvoices = AgriTrustDatabase.getBuyerInvoices(buyerProfile.id);
  const buyerRequests = AgriTrustDatabase.getBuyerProcurementRequests(buyerProfile.id);

  const totalSpent = buyerOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = buyerOrders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const creditUsed = buyerOrders.filter((o) => o.status !== 'DELIVERED').reduce((sum, o) => sum + o.total, 0);
  const creditAvailable = Math.max(0, buyerProfile.creditLimit - creditUsed);

  return (
    <div style={{ padding: '2.5rem 0 5rem', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Buyer Header Banner */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>VERIFIED COMMERCIAL BUYER</span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Active Account</span>
              </div>
              <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                {buyerProfile.businessName}
              </h1>
              <p className="text-secondary text-xs" style={{ marginTop: '0.15rem' }}>
                Representative: {buyerProfile.contactName} • Account ID: {buyerProfile.id}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onBrowseMarketplace} className="btn btn-primary btn-sm">
                <Plus size={16} /> Procure Wholesale Produce
              </button>
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Active Orders</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                {activeOrdersCount}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>In-Transit Shipments</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-accent)', marginTop: '0.2rem' }}>
                {buyerShipments.length}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Credit Line Available</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '0.2rem' }}>
                ${creditAvailable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-muted text-xs">Limit: ${buyerProfile.creditLimit.toLocaleString()}</span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Total Landed Spend</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Counterparty Privacy Shield Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--brand-primary-light)',
          border: '1px solid rgba(16, 128, 67, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          fontSize: '0.8125rem',
          color: 'var(--brand-primary)'
        }}>
          <Lock size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>AgriTrust Intermediary Privacy Boundary Active:</strong> All orders are routed through AgriTrust controlled intake. Producer names, private farm addresses, and phone numbers remain strictly confidential.
          </span>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`btn btn-sm ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShoppingBag size={16} /> Wholesale Orders ({buyerOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('LOGISTICS')}
            className={`btn btn-sm ${activeTab === 'LOGISTICS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Truck size={16} /> Cold-Chain Logistics ({buyerShipments.length})
          </button>
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`btn btn-sm ${activeTab === 'INVOICES' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FileText size={16} /> Invoices & Receipts ({buyerInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`btn btn-sm ${activeTab === 'REQUESTS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <RefreshCw size={16} /> Standing Demand Requests ({buyerRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`btn btn-sm ${activeTab === 'PROFILE' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <CreditCard size={16} /> Account & Credit Settings
          </button>
        </div>

        {/* Tab 1: Wholesale Orders */}
        {activeTab === 'ORDERS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {buyerOrders.map((ord) => (
              <div key={ord.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="text-muted text-xs font-bold" style={{ fontFamily: 'monospace' }}>ORDER ID: {ord.id}</span>
                    <span className="text-muted text-xs" style={{ display: 'block', marginTop: '0.15rem' }}>Placed: {new Date(ord.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`badge ${ord.status === 'DELIVERED' ? 'badge-success' : 'badge-brand'}`} style={{ fontSize: '0.8125rem' }}>
                    {ord.status}
                  </span>
                </div>

                {/* Line Items Table */}
                <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem' }}>Produce Item</th>
                        <th style={{ padding: '0.5rem' }}>Lot Token</th>
                        <th style={{ padding: '0.5rem' }}>Unit Price</th>
                        <th style={{ padding: '0.5rem' }}>Quantity</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Line Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ord.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{item.productName}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <button
                              onClick={() => onInspectTraceability(item.lotId)}
                              className="badge badge-brand"
                              style={{ border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}
                            >
                              <ShieldCheck size={11} /> {item.lotId}
                            </button>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>${item.unitPrice.toFixed(2)} / {item.unit}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{item.quantity} {item.unit}s</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', fontSize: '0.875rem' }}>
                  <div className="text-muted text-xs">
                    Subtotal: ${ord.subtotal.toFixed(2)} • Logistics: ${ord.logisticsFee.toFixed(2)} • Intermediary Fee: ${ord.platformFee.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                    Total Landed Price: <span style={{ color: 'var(--brand-primary)' }}>${ord.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Cold-Chain Logistics */}
        {activeTab === 'LOGISTICS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {buyerShipments.map(({ order, shipment }) => (
              <div key={shipment.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="text-muted text-xs font-bold" style={{ fontFamily: 'monospace' }}>SHIPMENT TRACKING: {shipment.trackingCode}</span>
                    <h3 className="text-base font-bold" style={{ marginTop: '0.15rem' }}>Carrier: {order.carrierName}</h3>
                  </div>
                  <span className="badge badge-accent" style={{ fontSize: '0.8125rem' }}>
                    <Truck size={14} /> {order.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span className="text-muted text-xs">Vehicle Spec</span>
                    <div className="font-semibold">{order.vehicleType}</div>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Origin Logistics Hub</span>
                    <div className="font-semibold">{order.originHub}</div>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Destination Hub</span>
                    <div className="font-semibold">{order.destinationHub}</div>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Estimated Arrival</span>
                    <div className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
                      {new Date(order.estArrival).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} color="var(--brand-primary)" />
                  <span>Current Location: <strong>{shipment.currentPublicLocation}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Invoices & Receipts */}
        {activeTab === 'INVOICES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {buyerInvoices.map((inv) => (
              <div key={inv.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ fontFamily: 'monospace' }}>INVOICE: {inv.invoiceNumber}</h4>
                    <span className="text-muted text-xs">Order ID: {inv.orderId} • Issued: {new Date(inv.issuedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-bold text-base" style={{ color: 'var(--brand-primary)' }}>${inv.amount.toFixed(2)}</div>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{inv.status} (ESCROW)</span>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    <Download size={14} /> Receipt PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Standing Procurement Requests */}
        {activeTab === 'REQUESTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {buyerRequests.map((req) => (
              <div key={req.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-brand" style={{ marginBottom: '0.35rem' }}>{req.status}</span>
                  <h4 className="text-base font-bold">{req.cropName}</h4>
                  <span className="text-muted text-xs">Volume Target: {req.quantityKg} kg • Max Price: ${req.maxPricePerKg.toFixed(2)} / kg</span>
                </div>
                <div className="text-muted text-xs">
                  Target Delivery: {req.requiredDeliveryDate}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Profile & Credit Settings */}
        {activeTab === 'PROFILE' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>Commercial Account Profile</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.875rem' }}>
              <div>
                <span className="text-muted text-xs">Registered Business Name</span>
                <div className="font-bold text-base">{buyerProfile.businessName}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Authorized Contact Representative</span>
                <div className="font-bold text-base">{buyerProfile.contactName}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Private Business Telephone</span>
                <div className="font-medium">{buyerProfile.privatePhone}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Private Delivery Headquarters Address</span>
                <div className="font-medium">{buyerProfile.privateAddress}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Approved Credit Line Limit</span>
                <div className="font-bold text-base" style={{ color: 'var(--brand-primary)' }}>
                  ${buyerProfile.creditLimit.toLocaleString()} USD
                </div>
              </div>
              <div>
                <span className="text-muted text-xs">Account Verification Status</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <span className="badge badge-success">
                    <CheckCircle2 size={14} /> Verified & Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
