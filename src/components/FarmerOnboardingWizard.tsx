import React, { useState } from 'react';
import { Leaf, ArrowRight, ArrowLeft, ShieldCheck, Lock, Upload, FileCheck, MapPin } from 'lucide-react';
import { FileSecurityManager } from '../core/security/fileSecurity';

interface FarmerOnboardingWizardProps {
  onComplete: (data: {
    email: string;
    businessName: string;
    contactName: string;
    privatePhone: string;
    privateAddress: string;
    privateGpsLat: number;
    privateGpsLng: number;
    publicRegion: string;
  }) => void;
  onCancel: () => void;
}

export const FarmerOnboardingWizard: React.FC<FarmerOnboardingWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [privateAddress, setPrivateAddress] = useState('');
  const [privateGpsLat, setPrivateGpsLat] = useState(13.1939);
  const [privateGpsLng, setPrivateGpsLng] = useState(-59.5432);
  const [publicRegion, setPublicRegion] = useState('Western Agricultural Zone 4');
  const [hectares, setHectares] = useState(25);
  const [farmingMethods, setFarmingMethods] = useState<string[]>(['Hydro-Cooled', 'Good Agricultural Practices (GAP)']);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = FileSecurityManager.validateUpload(file.name, file.type, file.size);
    if (!validation.valid) {
      setFileError(validation.reason || 'File validation failed');
      setUploadedFileName(null);
    } else {
      setFileError(null);
      setUploadedFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      if (!agreedTerms) return;
      onComplete({
        email,
        businessName,
        contactName,
        privatePhone: phone,
        privateAddress,
        privateGpsLat,
        privateGpsLng,
        publicRegion,
      });
    }
  };

  return (
    <div style={{ padding: '3rem 0 6rem', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Wizard Header Progress Bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase' }}>
              AGRICULTURAL PRODUCER ONBOARDING • STEP 0{step} OF 04
            </span>
            <span className="badge badge-brand" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
              Farmer Verification
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', height: '6px' }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: s <= step ? 'var(--brand-primary)' : 'var(--border-color)',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Card Form */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Producer Identity */}
            {step === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
                    <Leaf size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Producer & Farm Identity</h3>
                    <p className="text-secondary text-xs">Enter farm or agricultural co-operative details.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Farm / Agricultural Produce Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Holder Agricultural Produce"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Lead Producer Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Marcus Holder"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Work Email Address</label>
                    <input
                      type="email"
                      placeholder="m.holder@holderproduce.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Private Producer Telephone</label>
                    <input
                      type="tel"
                      placeholder="+1-555-019-4821"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Privacy Anonymization */}
            {step === 2 && (
              <div>
                <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Farm Location & Privacy Protection</h3>
                <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>Your private address & GPS coordinates are strictly protected inside AgriTrust core.</p>

                {/* Privacy Shield Banner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  backgroundColor: 'var(--brand-primary-light)',
                  border: '1px solid rgba(16, 128, 67, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--brand-primary)'
                }}>
                  <Lock size={18} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Bilateral Privacy Active:</strong> Buyers will only see your authorized regional token, never your street address or phone number.
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Private Farm Physical Address (AgriTrust Logistics Only)</label>
                    <input
                      type="text"
                      placeholder="742 Evergreen Valley Road, Plot 14"
                      value={privateAddress}
                      onChange={(e) => setPrivateAddress(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Private Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={privateGpsLat}
                        onChange={(e) => setPrivateGpsLat(parseFloat(e.target.value) || 0)}
                        className="input-field"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Private Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={privateGpsLng}
                        onChange={(e) => setPrivateGpsLng(parseFloat(e.target.value) || 0)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Public Regional Classification Token (Exposed on Ledger)</label>
                    <input
                      type="text"
                      value={publicRegion}
                      onChange={(e) => setPublicRegion(e.target.value)}
                      className="input-field"
                      readOnly
                      style={{ backgroundColor: 'var(--bg-surface-elevated)', fontWeight: 600 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Production Capacity */}
            {step === 3 && (
              <div>
                <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Production Capacity & Methods</h3>
                <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>Tell us about your active cultivation volume.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Total Active Cultivated Hectares</label>
                    <input
                      type="number"
                      value={hectares}
                      onChange={(e) => setHectares(parseInt(e.target.value) || 1)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Farming Methods & Certifications</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      {['Good Agricultural Practices (GAP)', 'Hydro-Cooled', 'Organic Certified', 'Drip Irrigation', 'Greenhouse Controlled'].map((method) => (
                        <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={farmingMethods.includes(method)}
                            onChange={(e) => {
                              if (e.target.checked) setFarmingMethods([...farmingMethods, method]);
                              else setFarmingMethods(farmingMethods.filter((m) => m !== method));
                            }}
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Phytosanitary Cert & Submission */}
            {step === 4 && (
              <div>
                <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Phytosanitary & Farm License Upload</h3>
                <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>Upload farm registration or phytosanitary certificate (PDF, JPG, PNG under 10MB).</p>

                <div style={{
                  padding: '2rem',
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  marginBottom: '1.25rem'
                }}>
                  <Upload size={32} color="var(--brand-primary)" style={{ marginBottom: '0.75rem' }} />
                  <p className="font-semibold text-sm">Select Phytosanitary / Farm License File</p>
                  
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileUpload}
                    style={{ marginTop: '1rem' }}
                  />

                  {uploadedFileName && (
                    <div style={{ marginTop: '1rem', color: 'var(--status-success)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <FileCheck size={16} /> Upload Validated: {uploadedFileName}
                    </div>
                  )}

                  {fileError && (
                    <div style={{ marginTop: '1rem', color: 'var(--status-danger)', fontSize: '0.8125rem' }}>
                      {fileError}
                    </div>
                  )}
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    style={{ marginTop: '0.2rem' }}
                    required
                  />
                  <span>I agree to AgriTrust Producer Terms and Minimum Margin Intermediary Protection Rules.</span>
                </label>
              </div>
            )}

            {/* Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev - 1)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                  Cancel
                </button>
              )}

              <button type="submit" className="btn btn-primary">
                <span>{step === 4 ? 'Submit Producer Registration' : 'Continue Step'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
