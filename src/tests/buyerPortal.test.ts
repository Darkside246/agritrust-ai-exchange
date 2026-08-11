import { describe, it, expect } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { PrivacyManager } from '../core/security/privacy';

describe('Page 4 Buyer Portal Dashboard & Operations', () => {
  it('retrieves buyer orders with correct landed calculations and lot line tokens', () => {
    AgriTrustDatabase.initialize();
    const orders = AgriTrustDatabase.getBuyerOrders('bp-01');

    expect(orders.length).toBeGreaterThan(0);
    const primaryOrder = orders[0];
    expect(primaryOrder.buyerId).toBe('bp-01');
    expect(primaryOrder.subtotal).toBe(1100.00);
    expect(primaryOrder.logisticsFee).toBe(45.00);
    expect(primaryOrder.platformFee).toBe(27.50);
    expect(primaryOrder.total).toBe(1172.50);

    // Verify line item lot tokens are present
    expect(primaryOrder.items[0].lotId).toBe('AT-LOT-2026-000922');
  });

  it('retrieves cold-chain logistics shipments with temperature specs', () => {
    AgriTrustDatabase.initialize();
    const shipments = AgriTrustDatabase.getBuyerShipments('bp-01');

    expect(shipments.length).toBeGreaterThan(0);
    const { order, shipment } = shipments[0];
    expect(order.status).toBe('IN_TRANSIT');
    expect(order.vehicleType).toContain('13.0°C');
    expect(shipment.trackingCode).toBe('AT-SHIP-881-8849');
  });

  it('retrieves buyer invoices and verifies credit line availability', () => {
    AgriTrustDatabase.initialize();
    const profile = AgriTrustDatabase.getBuyerProfileByUserId('usr-buyer-01');
    expect(profile).toBeDefined();
    if (!profile) return;

    const invoices = AgriTrustDatabase.getBuyerInvoices(profile.id);
    expect(invoices.length).toBeGreaterThan(0);

    const orders = AgriTrustDatabase.getBuyerOrders(profile.id);
    const activeOrderSpend = orders.filter((o) => o.status !== 'DELIVERED').reduce((sum, o) => sum + o.total, 0);
    const availableCredit = profile.creditLimit - activeOrderSpend;

    expect(availableCredit).toBeLessThan(profile.creditLimit);
    expect(availableCredit).toBe(50000 - 1172.50);
  });

  it('enforces counterparty privacy by hiding farmer PII from buyer profiles and orders', () => {
    AgriTrustDatabase.initialize();
    const farmerProfile = AgriTrustDatabase.getFarmerProfileByUserId('usr-farmer-01');
    expect(farmerProfile).toBeDefined();
    if (!farmerProfile) return;

    const redactedFarmer = PrivacyManager.redactFarmerProfile(farmerProfile);

    // Verify private phone, private address, and private GPS are stripped
    expect((redactedFarmer as any).privatePhone).toBeUndefined();
    expect((redactedFarmer as any).privateAddress).toBeUndefined();
    expect((redactedFarmer as any).privateGpsLat).toBeUndefined();

    // Verify only public regional token remains
    expect(redactedFarmer.publicRegion).toBe('Western Agricultural Zone 4');
  });
});
