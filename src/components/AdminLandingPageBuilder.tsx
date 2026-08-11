import React, { useState, useEffect, useCallback } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { CMSPageBlock, CMSBlockType, CMSPageRevision } from '../core/database/schema';
import { Hero } from './Hero';
import { ProductGrid } from './ProductGrid';
import { ControlledIntermediarySection } from './ControlledIntermediarySection';
import { HowItWorks } from './HowItWorks';
import { 
  ArrowLeft,
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw, 
  RotateCw, 
  Eye, 
  Save, 
  Send, 
  History, 
  Plus, 
  Trash2, 
  Copy, 
  EyeOff, 
  CheckCircle2, 
  X, 
  Layers,
  Sparkles,
  Settings,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AdminLandingPageBuilderProps {
  onBack?: () => void;
}

export const AdminLandingPageBuilder: React.FC<AdminLandingPageBuilderProps> = ({ onBack }) => {
  // Main Draft Blocks State
  const [blocks, setBlocks] = useState<CMSPageBlock[]>(AgriTrustDatabase.getDraftLandingPageBlocks());
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id || null);
  
  // Responsive Viewport Modes: Desktop 1440px, Tablet 768px, Mobile 390px
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState<CMSPageBlock[][]>([AgriTrustDatabase.getDraftLandingPageBlocks()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals & Notifications
  const [revisions, setRevisions] = useState<CMSPageRevision[]>(AgriTrustDatabase.getLandingPageRevisions());
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState<boolean>(false);
  const [blockToDeleteId, setBlockToDeleteId] = useState<string | null>(null);
  const [publishReason, setPublishReason] = useState<string>('Updated landing page hero and controlled intermediary model content.');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to push new state onto Undo/Redo stack
  const updateBlocksWithHistory = useCallback((newBlocks: CMSPageBlock[]) => {
    setBlocks(newBlocks);
    const nextStack = historyStack.slice(0, historyIndex + 1);
    setHistoryStack([...nextStack, JSON.parse(JSON.stringify(newBlocks))]);
    setHistoryIndex(nextStack.length);
  }, [historyStack, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setBlocks(JSON.parse(JSON.stringify(historyStack[prevIdx])));
    }
  }, [historyIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setBlocks(JSON.parse(JSON.stringify(historyStack[nextIdx])));
    }
  }, [historyIndex, historyStack]);

  // Save Draft
  const handleSaveDraft = useCallback(() => {
    AgriTrustDatabase.saveLandingPageDraft(blocks, 'sys-admin');
    setSuccessMsg('Landing Page DRAFT saved successfully! Public website remains untouched until Published.');
  }, [blocks]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSaveDraft]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const handleConfirmPublish = () => {
    AgriTrustDatabase.saveLandingPageDraft(blocks, 'sys-admin');
    const result = AgriTrustDatabase.publishLandingPage('sys-admin', publishReason);
    setSuccessMsg(`Version ${result.version} PUBLISHED live successfully! Public website updated.`);
    setShowPublishModal(false);
    setRevisions(AgriTrustDatabase.getLandingPageRevisions());
  };

  const handleRestoreVersion = (ver: number) => {
    AgriTrustDatabase.restoreLandingPageRevision(ver, 'sys-admin');
    const restoredDraft = AgriTrustDatabase.getDraftLandingPageBlocks();
    setBlocks(restoredDraft);
    setHistoryStack([JSON.parse(JSON.stringify(restoredDraft))]);
    setHistoryIndex(0);
    setSuccessMsg(`Restored Landing Page to Version ${ver}!`);
    setShowHistoryModal(false);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    newBlocks.forEach((b, idx) => {
      b.displayOrder = idx + 1;
    });

    updateBlocksWithHistory(newBlocks);
  };

  const handleToggleVisibility = (id: string) => {
    const newBlocks = blocks.map((b) => {
      if (b.id === id) {
        return { ...b, settings: { ...b.settings, visible: !b.settings.visible } };
      }
      return b;
    });
    updateBlocksWithHistory(newBlocks);
  };

  const handleConfirmDeleteBlock = () => {
    if (!blockToDeleteId) return;
    const newBlocks = blocks.filter((b) => b.id !== blockToDeleteId);
    updateBlocksWithHistory(newBlocks);
    if (selectedBlockId === blockToDeleteId) setSelectedBlockId(newBlocks[0]?.id || null);
    setBlockToDeleteId(null);
  };

  const handleDuplicateBlock = (block: CMSPageBlock) => {
    const newId = `block-${block.type.toLowerCase()}-${Date.now()}`;
    const duplicate: CMSPageBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: newId,
      title: `${block.title} (Copy)`,
      displayOrder: blocks.length + 1,
    };
    const newBlocks = [...blocks, duplicate];
    updateBlocksWithHistory(newBlocks);
    setSelectedBlockId(newId);
  };

  const handleAddBlock = (type: CMSBlockType) => {
    const newId = `block-${type.toLowerCase()}-${Date.now()}`;
    let newBlock: CMSPageBlock;

    if (type === 'CONTROLLED_INTERMEDIARY') {
      newBlock = {
        id: newId,
        type: 'CONTROLLED_INTERMEDIARY',
        title: 'How AgriTrust Secures Wholesale Agriculture',
        subtitle: 'AgriTrust brings supply, quality, pricing, logistics, and fulfilment together through one coordinated wholesale platform.',
        displayOrder: blocks.length + 1,
        content: {
          eyebrow: 'Controlled Intermediary Model',
          benefits: [
            { title: 'Quality Controlled', description: "Produce is assessed through AgriTrust's quality processes.", icon: 'ShieldCheck' },
            { title: 'Supply Coordinated', description: 'We coordinate agricultural supply to meet bulk demand.', icon: 'Layers' },
            { title: 'Wholesale Focused', description: 'Designed around commercial purchasing and wholesale pricing.', icon: 'ShoppingBag' },
            { title: 'Fulfilment Managed', description: 'AgriTrust coordinates logistics from supply through delivery.', icon: 'Truck' },
            { title: 'Traceable', description: 'Every eligible lot maintains a structured traceability record.', icon: 'FileCheck' },
          ]
        },
        settings: { visible: true, bgStyle: 'surface', alignment: 'left' }
      };
    } else {
      newBlock = {
        id: newId,
        type,
        title: `New ${type.replace('_', ' ')} Section`,
        subtitle: 'Add descriptive subheading here.',
        displayOrder: blocks.length + 1,
        settings: { visible: true, bgStyle: 'surface', alignment: 'center' },
      };
    }

    const newBlocks = [...blocks, newBlock];
    updateBlocksWithHistory(newBlocks);
    setSelectedBlockId(newId);
    setShowAddBlockModal(false);
  };

  const handleUpdateSelectedBlock = (field: string, value: any) => {
    if (!selectedBlockId) return;

    const newBlocks = blocks.map((b) => {
      if (b.id === selectedBlockId) {
        if (field === 'title' || field === 'subtitle') {
          return { ...b, [field]: value };
        }
        if (field.startsWith('content.')) {
          const contentKey = field.replace('content.', '');
          return {
            ...b,
            content: {
              ...b.content,
              [contentKey]: value,
            },
          };
        }
        return {
          ...b,
          settings: {
            ...b.settings,
            [field]: value,
          },
        };
      }
      return b;
    });

    updateBlocksWithHistory(newBlocks);
  };

  const products = AgriTrustDatabase.getProducts();

  const getCanvasWidth = () => {
    if (viewportMode === 'mobile') return '390px';
    if (viewportMode === 'tablet') return '768px';
    return '1440px';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 'calc(100vh - 120px)' }}>
      {/* SECTION 5: TOP TOOLBAR */}
      <div className="card" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        {/* Left Controls: Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onBack && (
            <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div>
            <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.1rem' }}>TRUE VISUAL PAGE BUILDER</span>
            <h1 className="text-lg font-bold" style={{ margin: 0 }}>Landing Page Visual Editor</h1>
          </div>
        </div>

        {/* Viewport Presets: 1440px Desktop | 768px Tablet | 390px Mobile */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button onClick={() => setViewportMode('desktop')} className={`btn btn-sm ${viewportMode === 'desktop' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem', gap: '0.35rem' }} title="Desktop Viewport (1440px)">
            <Monitor size={14} /> Desktop (1440px)
          </button>
          <button onClick={() => setViewportMode('tablet')} className={`btn btn-sm ${viewportMode === 'tablet' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem', gap: '0.35rem' }} title="Tablet Viewport (768px)">
            <Tablet size={14} /> Tablet (768px)
          </button>
          <button onClick={() => setViewportMode('mobile')} className={`btn btn-sm ${viewportMode === 'mobile' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem', gap: '0.35rem' }} title="Mobile Viewport (390px)">
            <Smartphone size={14} /> Mobile (390px)
          </button>
        </div>

        {/* Action Buttons: Undo, Redo, Preview, Save Draft, Publish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={handleUndo} disabled={historyIndex === 0} className="btn btn-secondary btn-sm" title="Undo (Ctrl+Z)">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= historyStack.length - 1} className="btn btn-secondary btn-sm" title="Redo (Ctrl+Shift+Z)">
            <RotateCw size={14} />
          </button>
          <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`btn btn-sm ${isPreviewMode ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
            <Eye size={14} /> {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button onClick={() => setShowHistoryModal(true)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
            <History size={14} /> Revisions ({revisions.length})
          </button>
          <button onClick={handleSaveDraft} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} title="Save Draft (Ctrl+S)">
            <Save size={14} /> Save Draft
          </button>
          <button onClick={() => setShowPublishModal(true)} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}>
            <Send size={14} /> Publish
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* WORKSPACE GRID: Navigator Panel | Center Canvas | Right Inspector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isPreviewMode ? '1fr' : selectedBlock ? '280px 1fr 340px' : '280px 1fr',
        gap: '1.25rem',
        flex: 1,
        minHeight: '750px'
      }}>
        {/* LEFT NAVIGATOR PANEL */}
        {!isPreviewMode && (
          <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '820px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
              <h3 className="font-bold text-xs uppercase text-muted style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}">
                <Layers size={14} /> Page Blocks ({blocks.length})
              </h3>
              <button onClick={() => setShowAddBlockModal(true)} className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                + Add Section
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${selectedBlockId === block.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: selectedBlockId === block.id ? 'var(--brand-primary-light)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: block.settings.visible ? 1 : 0.45,
                    fontSize: '0.8125rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="badge badge-brand" style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem' }}>{block.type}</span>
                      {!block.settings.visible && <span className="badge badge-secondary" style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem' }}>HIDDEN</span>}
                    </div>
                    <div style={{ fontWeight: 700, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: selectedBlockId === block.id ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                      {block.title}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleMoveBlock(index, 'up')} disabled={index === 0} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.25rem' }}>
                      <ArrowUp size={11} />
                    </button>
                    <button onClick={() => handleMoveBlock(index, 'down')} disabled={index === blocks.length - 1} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.25rem' }}>
                      <ArrowDown size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: REAL PAGE CANVAS (Center) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'var(--bg-primary)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          minHeight: '750px'
        }}>
          <div style={{
            width: getCanvasWidth(),
            maxWidth: '100%',
            transition: 'width 0.3s ease',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }}>
            {/* RENDER ACTUAL PUBLIC PAGE COMPONENTS */}
            {blocks.map((block, index) => {
              if (!block.settings.visible && isPreviewMode) return null;

              const isSelected = selectedBlockId === block.id && !isPreviewMode;

              return (
                <div key={block.id} style={{ position: 'relative', opacity: block.settings.visible ? 1 : 0.5 }}>
                  {/* Subtle Hidden Watermark indicator in Editor Canvas */}
                  {!block.settings.visible && !isPreviewMode && (
                    <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 15 }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.65rem', backgroundColor: '#e53e3e', color: '#fff' }}>HIDDEN BLOCK</span>
                    </div>
                  )}

                  {block.type === 'HERO' && (
                    <Hero
                      block={block}
                      onBrowseClick={() => {}}
                      onOpenBuyerAuth={() => {}}
                      onOpenSellerAuth={() => {}}
                      isEditorMode={!isPreviewMode}
                      isSelected={isSelected}
                      onSelect={() => !isPreviewMode && setSelectedBlockId(block.id)}
                      onMoveUp={index > 0 ? () => handleMoveBlock(index, 'up') : undefined}
                      onMoveDown={index < blocks.length - 1 ? () => handleMoveBlock(index, 'down') : undefined}
                      onDuplicate={() => handleDuplicateBlock(block)}
                      onHide={() => handleToggleVisibility(block.id)}
                      onDelete={() => setBlockToDeleteId(block.id)}
                    />
                  )}

                  {block.type === 'PRODUCT_GRID' && (
                    <ProductGrid
                      block={block}
                      products={products}
                      searchQuery=""
                      onAddToCart={() => {}}
                      onViewDetails={() => {}}
                      isEditorMode={!isPreviewMode}
                      isSelected={isSelected}
                      onSelect={() => !isPreviewMode && setSelectedBlockId(block.id)}
                      onMoveUp={index > 0 ? () => handleMoveBlock(index, 'up') : undefined}
                      onMoveDown={index < blocks.length - 1 ? () => handleMoveBlock(index, 'down') : undefined}
                      onDuplicate={() => handleDuplicateBlock(block)}
                      onHide={() => handleToggleVisibility(block.id)}
                      onDelete={() => setBlockToDeleteId(block.id)}
                    />
                  )}

                  {block.type === 'CONTROLLED_INTERMEDIARY' && (
                    <ControlledIntermediarySection
                      block={block}
                      isEditorMode={!isPreviewMode}
                      isSelected={isSelected}
                      onSelect={() => !isPreviewMode && setSelectedBlockId(block.id)}
                      onMoveUp={index > 0 ? () => handleMoveBlock(index, 'up') : undefined}
                      onMoveDown={index < blocks.length - 1 ? () => handleMoveBlock(index, 'down') : undefined}
                      onDuplicate={() => handleDuplicateBlock(block)}
                      onHide={() => handleToggleVisibility(block.id)}
                      onDelete={() => setBlockToDeleteId(block.id)}
                    />
                  )}

                  {block.type === 'HOW_IT_WORKS' && (
                    <HowItWorks />
                  )}

                  {/* Fallback rendering for generic block types */}
                  {block.type !== 'HERO' && block.type !== 'PRODUCT_GRID' && block.type !== 'CONTROLLED_INTERMEDIARY' && block.type !== 'HOW_IT_WORKS' && (
                    <div
                      onClick={() => !isPreviewMode && setSelectedBlockId(block.id)}
                      style={{
                        padding: '3rem 1.5rem',
                        textAlign: block.settings.alignment || 'center',
                        backgroundColor: block.settings.bgStyle === 'surface' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                        outline: isSelected ? '2px solid var(--brand-primary)' : '1px dashed var(--border-color)',
                        cursor: isPreviewMode ? 'default' : 'pointer'
                      }}
                    >
                      <h3 className="text-2xl font-bold">{block.title}</h3>
                      <p className="text-secondary text-sm" style={{ marginTop: '0.5rem' }}>{block.subtitle}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 9: RIGHT SIDEBAR DYNAMIC BLOCK INSPECTOR */}
        {!isPreviewMode && selectedBlock && (
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '820px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.6rem' }}>BLOCK INSPECTOR</span>
                <h3 className="font-bold text-sm">{selectedBlock.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => handleToggleVisibility(selectedBlock.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                  {selectedBlock.settings.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => setSelectedBlockId(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Common Section Heading Fields */}
              <div className="input-group">
                <label className="input-label">Section Heading</label>
                <input
                  type="text"
                  value={selectedBlock.title}
                  onChange={(e) => handleUpdateSelectedBlock('title', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Subheading / Description</label>
                <textarea
                  value={selectedBlock.subtitle || ''}
                  onChange={(e) => handleUpdateSelectedBlock('subtitle', e.target.value)}
                  rows={3}
                  className="input-field"
                />
              </div>

              {/* Controlled Intermediary Block Fields (Section 30) */}
              {selectedBlock.type === 'CONTROLLED_INTERMEDIARY' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Eyebrow Badge</label>
                    <input
                      type="text"
                      value={selectedBlock.content?.eyebrow || 'Controlled Intermediary Model'}
                      onChange={(e) => handleUpdateSelectedBlock('content.eyebrow', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Hero Image URL</label>
                    <input
                      type="text"
                      value={selectedBlock.settings.imageUrl || ''}
                      onChange={(e) => handleUpdateSelectedBlock('imageUrl', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {/* Hero Specific Fields */}
              {selectedBlock.type === 'HERO' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Primary Button Text (Buy Now)</label>
                    <input
                      type="text"
                      value={selectedBlock.settings.primaryButtonText || 'BUY NOW'}
                      onChange={(e) => handleUpdateSelectedBlock('primaryButtonText', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Secondary Button Text (Become a Buyer)</label>
                    <input
                      type="text"
                      value={selectedBlock.settings.secondaryButtonText || 'BECOME A BUYER'}
                      onChange={(e) => handleUpdateSelectedBlock('secondaryButtonText', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Text Link Text (Sell Your Produce)</label>
                    <input
                      type="text"
                      value={selectedBlock.settings.textLinkText || 'SELL YOUR PRODUCE'}
                      onChange={(e) => handleUpdateSelectedBlock('textLinkText', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Hero Image URL</label>
                    <input
                      type="text"
                      value={selectedBlock.settings.imageUrl || ''}
                      onChange={(e) => handleUpdateSelectedBlock('imageUrl', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {/* Product Grid Fields (Section 28 & 29) */}
              {selectedBlock.type === 'PRODUCT_GRID' && (
                <div className="input-group">
                  <label className="input-label">Display Product Limit</label>
                  <input
                    type="number"
                    value={selectedBlock.settings.limit || 6}
                    onChange={(e) => handleUpdateSelectedBlock('limit', parseInt(e.target.value, 10) || 3)}
                    className="input-field"
                  />
                </div>
              )}

              {/* Background Style */}
              <div className="input-group">
                <label className="input-label">Background Design</label>
                <select
                  value={selectedBlock.settings.bgStyle || 'surface'}
                  onChange={(e) => handleUpdateSelectedBlock('bgStyle', e.target.value)}
                  className="input-field"
                >
                  <option value="light">Light Primary</option>
                  <option value="surface">Elevated Surface</option>
                  <option value="brand">Agri Green Light</option>
                </select>
              </div>

              {/* Inspector Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button onClick={() => handleDuplicateBlock(selectedBlock)} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.7rem' }}>
                  <Copy size={13} /> Duplicate Block
                </button>
                <button onClick={() => setBlockToDeleteId(selectedBlock.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--status-danger)', fontSize: '0.7rem' }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD BLOCK MODAL (Section 16) */}
      {showAddBlockModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '520px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Add Landing Page Section</h3>
              <button onClick={() => setShowAddBlockModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {(['HERO', 'PRODUCT_GRID', 'CONTROLLED_INTERMEDIARY', 'CATEGORIES', 'HOW_IT_WORKS', 'CTA_SECTION', 'FAQ', 'STATS', 'BANNER'] as CMSBlockType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="btn btn-secondary btn-md"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', textTransform: 'capitalize', fontSize: '0.8125rem' }}
                >
                  <span className="badge badge-brand" style={{ fontSize: '0.6rem', marginBottom: '0.25rem' }}>{type}</span>
                  <strong style={{ fontSize: '0.875rem' }}>{type.replace('_', ' ')}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (Section 19) */}
      {blockToDeleteId && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '420px', width: '90%', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 className="text-xl font-bold" style={{ color: 'var(--status-danger)' }}>Delete this section?</h3>
            <p className="text-secondary text-sm">
              This section will be removed from the current draft. Historical revision data is preserved.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setBlockToDeleteId(null)} className="btn btn-secondary btn-md">
                Cancel
              </button>
              <button onClick={handleConfirmDeleteBlock} className="btn btn-primary btn-md" style={{ backgroundColor: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}>
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH CONFIRMATION MODAL (Section 35) */}
      {showPublishModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 className="text-xl font-bold">Publish Changes?</h3>
            <p className="text-secondary text-sm">
              This action will publish your draft configuration to the live AgriTrust public landing page.
            </p>

            <div className="input-group">
              <label className="input-label">Audit Log Reason for Publication</label>
              <input
                type="text"
                value={publishReason}
                onChange={(e) => setPublishReason(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setShowPublishModal(false)} className="btn btn-secondary btn-md">
                Cancel
              </button>
              <button onClick={handleConfirmPublish} className="btn btn-primary btn-md" style={{ padding: '0.6rem 1.5rem' }}>
                <Send size={16} /> Publish Changes Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION HISTORY MODAL (Section 34) */}
      {showHistoryModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '640px', width: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Landing Page Revisions History</h3>
              <button onClick={() => setShowHistoryModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {revisions.length === 0 ? (
                <div className="text-muted text-sm" style={{ padding: '2rem', textAlign: 'center' }}>No published revisions recorded yet.</div>
              ) : (
                revisions.map((rev) => (
                  <div key={rev.version} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>Version {rev.version}</div>
                      <div className="text-xs text-muted">Published: {new Date(rev.timestamp).toLocaleString()} by {rev.author}</div>
                      <div className="text-xs text-secondary" style={{ marginTop: '0.2rem' }}>{rev.auditReason || 'No reason provided'}</div>
                    </div>
                    <button onClick={() => handleRestoreVersion(rev.version)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                      Restore Version {rev.version}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
