import React, { useState, useContext } from 'react';
import { Context } from '../../context';

const AccessibilityToolbar = () => {
  const { context, dispatch } = useContext(Context);
  const [isOpen, setIsOpen] = useState(false);

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
  };

  const handleHighContrastToggle = () => {
    dispatch({ type: 'toggleHighContrast' });
  };

  const handleFontSizeChange = (size) => {
    dispatch({ type: 'setFontSize', payload: size });
  };

  const handleReset = () => {
    dispatch({ type: 'resetAccessibility' });
  };

  const handleToolbarKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      const toggle = document.querySelector('.accessibility-toolbar-toggle');
      if (toggle) toggle.focus();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className="accessibility-toolbar-toggle"
        onClick={toggleToolbar}
        aria-label="Options d'accessibilité"
        aria-expanded={isOpen}
        title="Options d'accessibilité"
      >
        <i className="fas fa-universal-access" aria-hidden="true"></i>
      </button>

      {/* Toolbar */}
      {isOpen && (
        <div
          className="accessibility-toolbar"
          onKeyDown={handleToolbarKeyDown}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Accessibilité</h3>
            <button
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '4px'
              }}
              onClick={toggleToolbar}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          {/* High Contrast */}
          <div style={{ marginBottom: '15px' }}>
            <button
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: context.accessibility.highContrast ? '#E35226' : '#f8f9fa',
                color: context.accessibility.highContrast ? 'white' : '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={handleHighContrastToggle}
            >
              <i className="fas fa-adjust" aria-hidden="true"></i>
              Contraste élevé
            </button>
            <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
              Améliore la lisibilité avec des couleurs contrastées
            </small>
          </div>

          {/* Font Size */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Taille de police
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { value: 'small', label: 'Petite' },
                { value: 'medium', label: 'Moyenne' },
                { value: 'large', label: 'Grande' },
                { value: 'extra-large', label: 'Très grande' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: context.accessibility.fontSize === value ? '#E35226' : '#f8f9fa',
                    color: context.accessibility.fontSize === value ? 'white' : '#333',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onClick={() => handleFontSizeChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div style={{ paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <button
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#f8f9fa',
                color: '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={handleReset}
            >
              <i className="fas fa-undo" aria-hidden="true"></i>
              Réinitialiser
            </button>
            <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
              Remet tous les paramètres par défaut
            </small>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityToolbar;
