import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { SupplySubmission, ProduceGrade, ProductUnit } from '../core/database/schema';
import { Leaf, Upload, CheckCircle2, ShieldCheck, Calendar, MapPin, Package, ArrowRight, X } from 'lucide-react';

interface SellerSupplyIntakeProps {
  sellerId?: string;
  onSuccess?: (submission: SupplySubmission) => void;
  onCancel?: () => void;
}

export const SellerSupplyIntake: React.FC<SellerSupplyIntakeProps> = ({
  sellerId = 'fp-01',
  onSuccess,
  onCancel,
}) => {
  const [commodity, setCommodity] = useState<string>('Tomatoes');
  const [variety, setVariety] = useState<string>('Vine Ripened Regular');
  const [description, setDescription] = useState<string>('');
  const [expectedGrade, setExpectedGrade] = useState<ProduceGrade>('Grade A');
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState<ProductUnit>('kg');
  const [minimumQuantity, setMinimumQuantity] = useState<number>(50);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableFrom, setAvailableFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableUntil, setAvailableUntil] = useState<string>(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(14);
  const [growingMethod, setGrowingMethod] = useState<string>('Drip Irrigated Field');
  const [packagingType, setPackagingType] = useState<string>('Reusable Plastic Crates (20kg)');
  const [collectionMethod, setCollectionMethod] = useState<string>('AgriTrust Logistics Pickup');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1592924357228-91a4daadcfea');
  const [submittedResult, setSubmittedResult] = useState<SupplySubmission | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission = AgriTrustDatabase.createSupplySubmission(
      {
        commodity,
        variety,
        description,
        expectedGrade,
        estimatedQuantity,
        unit,
        minimumQuantity,
        expectedHarvestDate,
        availableFrom,
        availableUntil,
        expectedShelfLifeDays: shelfLifeDays,
        growingMethod,
        packagingType,
        preferredCollectionMethod: collectionMethod,
        additionalNotes,
        images: [imageUrl],
      },
      sellerId
    );

    setSubmittedResult(submission);
    if (onSuccess) onSuccess(submission);
  };

  if (submittedResult) {
    return (
      <div className="card" style={{ padding: '2.5rem', maxWidth: '640px', margin: '2rem auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <CheckCircle2 size={36} />
        </div>

        <div>
          <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>SUBMISSION REGISTERED</span>
          <h2 className="text-2xl font-bold">Supply Submission Received</h2>
          <p className="text-secondary text-sm" style={{ marginTop: '0.35rem' }}>
            Reference Token: <strong style={{ fontFamily: 'monospace', color: 'var(--brand-primary)' }}>{submittedResult.id}</strong>
          </p>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Status:</span>
            <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>{submittedResult.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Produce:</span>
            <strong>{submittedResult.commodity} - {submittedResult.variety}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Quantity:</span>
            <strong>{submittedResult.estimatedQuantity} {submittedResult.unit}s</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Harvest Date:</span>
            <strong>{submittedResult.expectedHarvestDate}</strong>
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--brand-primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--brand-primary)', textAlign: 'left' }}>
          <strong>Notice:</strong> AgriTrust is reviewing your submission. We may contact you if additional information or quality inspection is required. Your identity remains protected under AgriTrust's Bilateral Privacy Shield.
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => setSubmittedResult(null)} className="btn btn-secondary btn-md">
            Submit Another Supply
          </button>
          {onCancel && (
            <button onClick={onCancel} className="btn btn-primary btn-md">
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>SELLER INTAKE PORTAL</span>
          <h1 className="text-2xl font-bold">Sell My Produce — Submit Available Supply</h1>
          <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
            Submit your current or upcoming harvest batch for AgriTrust wholesale commercial distribution.
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.6rem' }}>
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Produce Basics */}
        <div>
          <h3 className="font-bold text-base" style={{ marginBottom: '1rem', color: 'var(--brand-primary)' }}>1. Produce Identification</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Commodity</label>
              <select value={commodity} onChange={(e) => setCommodity(e.target.value)} className="input-field" required>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Lettuce">Lettuce</option>
                <option value="Cucumbers">Cucumbers</option>
                <option value="Peppers">Peppers</option>
                <option value="Sweet Potatoes">Sweet Potatoes</option>
                <option value="Carrots">Carrots</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Variety / Type</label>
              <input type="text" value={variety} onChange={(e) => setVariety(e.target.value)} required className="input-field" placeholder="e.g. Vine Ripened Regular" />
            </div>
          </div>
        </div>

        {/* Quantity & MOQ */}
        <div>
          <h3 className="font-bold text-base" style={{ marginBottom: '1rem', color: 'var(--brand-primary)' }}>2. Quantity & Order Constraints</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Estimated Total Quantity</label>
              <input type="number" value={estimatedQuantity} onChange={(e) => setEstimatedQuantity(parseInt(e.target.value, 10) || 0)} required className="input-field" />
            </div>

            <div className="input-group">
              <label className="input-label">Wholesale Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as ProductUnit)} className="input-field" required>
                <option value="kg">Kilograms (kg)</option>
                <option value="crate">Crates</option>
                <option value="box">Boxes</option>
                <option value="case">Cases</option>
                <option value="pallet">Pallets</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Minimum Available Quantity (MOQ)</label>
              <input type="number" value={minimumQuantity} onChange={(e) => setMinimumQuantity(parseInt(e.target.value, 10) || 1)} required className="input-field" />
            </div>
          </div>
        </div>

        {/* Dates & Quality */}
        <div>
          <h3 className="font-bold text-base" style={{ marginBottom: '1rem', color: 'var(--brand-primary)' }}>3. Harvest Timeline & Quality Expectations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Expected Harvest Date</label>
              <input type="date" value={expectedHarvestDate} onChange={(e) => setExpectedHarvestDate(e.target.value)} required className="input-field" />
            </div>

            <div className="input-group">
              <label className="input-label">Expected Grade</label>
              <select value={expectedGrade} onChange={(e) => setExpectedGrade(e.target.value as ProduceGrade)} className="input-field">
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Premium">Premium</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Expected Shelf Life (Days)</label>
              <input type="number" value={shelfLifeDays} onChange={(e) => setShelfLifeDays(parseInt(e.target.value, 10) || 7)} required className="input-field" />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Growing Method</label>
            <input type="text" value={growingMethod} onChange={(e) => setGrowingMethod(e.target.value)} className="input-field" />
          </div>

          <div className="input-group">
            <label className="input-label">Packaging Type</label>
            <input type="text" value={packagingType} onChange={(e) => setPackagingType(e.target.value)} className="input-field" />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Produce Description & Special Notes</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field" placeholder="Provide details regarding Brix, texture, color, or collection access..." />
        </div>

        <div className="input-group">
          <label className="input-label">Produce Image URL</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-field" />
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--brand-primary)' }} />
          <span>Your private farm location & contact details will be kept confidential from commercial buyers by AgriTrust.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary btn-md">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-md" style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Submit Supply to AgriTrust</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};
