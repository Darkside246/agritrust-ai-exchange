import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, FileCheck, Upload } from 'lucide-react';
import { FileSecurityManager } from '../core/security/fileSecurity';

interface BuyerOnboardingWizardProps {
  onComplete: (data: {
    email: string;
    businessName: string;
    contactName: string;
    privatePhone: string;
    privateAddress: string;
  }) => void;
  onCancel: () => void;
}

export const BuyerOnboardingWizard: React.FC<BuyerOnboardingWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('5,000 kg - 20,000 kg');
  const [targetCommodities, setTargetCommodities] = useState<string[]>(['Tomatoes', 'Lettuce']);
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
        privateAddress: address,
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
              COMMERCIAL BUYER ONBOARDING • STEP 0{step} OF 04
            </span>
            <span className="badge badge-brand">Buyer Verification</span>
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
            {/* Step 1: Business Identity */}
            {step === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-accent-light)', color: 'var(--brand-accent)' }}>
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Business & Representative Identity</h3>
                    <p className="text-secondary text-xs">Enter your registered business and contact details.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Registered Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Island Fresh Hospitality Group"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Authorized Representative Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
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
                      placeholder="procurement@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Private Business Telephone</label>
                    <input
                      type="tel"
                      placeholder="+1-555-018-9920"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Private Delivery / Head Office Address</label>
                    <input
                      type="text"
                      placeholder="88 Harbour View Boulevard, Suite 400"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Procurement Preferences */}
            {step === 2 && (
              <div>
                <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Procurement & Volume Requirements</h3>
                <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>Help AgriTrust optimize batch logistics for your orders.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Estimated Monthly Produce Volume</label>
                    <select
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(e.target.value)}
                      className="input-field"
                    >
                      <option value="1,000 kg - 5,000 kg">1,000 kg - 5,000 kg / month</option>
                      <option value="5,000 kg - 20,000 kg">5,000 kg - 20,000 kg / month</option>
                      <option value="20,000 kg+">20,000 kg+ / month (Enterprise)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Primary Target Produce Commodities</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      {['Tomatoes', 'Lettuce', 'Cucumbers', 'Peppers', 'Onions', 'Carrots'].map((item) => (
                        <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={targetCommodities.includes(item)}
                            onChange={(e) => {
                              if (e.target.checked) setTargetCommodities([...targetCommodities, item]);
                              else setTargetCommodities(targetCommodities.filter((c) => c !== item));
                            }}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <div>
                <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Commercial License Upload</h3>
                <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>Upload business registration or tax certificate (PDF, JPG, PNG under 10MB).</p>

                <div style={{
                  padding: '2rem',
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  marginBottom: '1.25rem'
                }}>
                  <Upload size={32} color="var(--brand-primary)" style={{ marginBottom: '0.75rem' }} />
                  <p className="font-semibold text-sm">Select Business License Document</p>
                  <p className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>Strict MIME & file security checks applied.</p>
                  
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
              </div>
            )}

            {/* Step 4: Terms & Agreement */}
            {step === 4 && (
              <div>
                <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Terms & Intermediary Verification</h3>
                <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>Review bilateral privacy and wholesale terms.</p>

                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6
                }}>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>1. Bilateral Privacy Boundary:</strong> As a commercial buyer, you acknowledge that AgriTrust acts as the controlled intermediary. Producer identities and farm addresses remain confidential.
                  </p>
                  <p>
                    <strong>2. Minimum Margin Protection:</strong> AgriTrust enforces minimum margin calculations on wholesale lots. Orders falling below minimum landed thresholds cannot be executed.
                  </p>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    style={{ marginTop: '0.2rem' }}
                    required
                  />
                  <span>I agree to AgriTrust Commercial Wholesale Terms and privacy policies.</span>
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
                <span>{step === 4 ? 'Complete Registration' : 'Continue Step'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
