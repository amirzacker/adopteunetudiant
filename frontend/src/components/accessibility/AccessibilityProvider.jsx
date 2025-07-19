import React, { useContext, useEffect, useRef } from 'react';
import { Context } from '../../context';


export const SkipLink = ({ href, children }) => {
  return (
    <a href={href} className="skip-link">
      {children}
    </a>
  );
};


export const useFocusManager = () => {
  const focusElement = (element) => {
    if (element) {
      element.focus();
    }
  };

  const focusById = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
    }
  };

  const focusFirst = (container) => {
    if (container) {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  };

  return {
    focusElement,
    focusById,
    focusFirst
  };
};

/**
 * Keyboard Navigation Hook
 * Provides keyboard navigation utilities
 */
export const useKeyboardNavigation = () => {
  const handleKeyDown = (e, callbacks) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        if (callbacks.onActivate) {
          e.preventDefault();
          callbacks.onActivate(e);
        }
        break;
      case 'Escape':
        if (callbacks.onEscape) {
          e.preventDefault();
          callbacks.onEscape(e);
        }
        break;
      default:
        break;
    }
  };

  return { handleKeyDown };
};

/**
 * ARIA Attributes Hook
 * Provides ARIA attributes for accessibility
 */
export const useAriaAttributes = () => {
  const { context } = useContext(Context);

  const getAriaAttributes = (options = {}) => {
    const attributes = {};

    if (options.label) {
      attributes['aria-label'] = options.label;
    }

    if (options.labelledBy) {
      attributes['aria-labelledby'] = options.labelledBy;
    }

    if (options.describedBy) {
      attributes['aria-describedby'] = options.describedBy;
    }

    if (options.expanded !== undefined) {
      attributes['aria-expanded'] = options.expanded;
    }

    if (options.selected !== undefined) {
      attributes['aria-selected'] = options.selected;
    }

    if (options.checked !== undefined) {
      attributes['aria-checked'] = options.checked;
    }

    if (options.disabled !== undefined) {
      attributes['aria-disabled'] = options.disabled;
    }

    if (options.hidden !== undefined) {
      attributes['aria-hidden'] = options.hidden;
    }

    if (options.live) {
      attributes['aria-live'] = options.live;
    }

    if (options.role) {
      attributes['role'] = options.role;
    }

    if (options.tabIndex !== undefined) {
      attributes['tabIndex'] = options.tabIndex;
    }

    return attributes;
  };

  return { getAriaAttributes };
};

/**
 * Color Contrast Validator
 * Validates color contrast ratios for WCAG compliance
 */
export const useColorContrast = () => {
  const calculateLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const calculateContrastRatio = (color1, color2) => {
    const lum1 = calculateLuminance(...color1);
    const lum2 = calculateLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const isWCAGCompliant = (foreground, background, level = 'AA', size = 'normal') => {
    const ratio = calculateContrastRatio(foreground, background);
    const minRatio = level === 'AAA' 
      ? (size === 'large' ? 4.5 : 7) 
      : (size === 'large' ? 3 : 4.5);
    return ratio >= minRatio;
  };

  return {
    calculateContrastRatio,
    isWCAGCompliant
  };
};

/**
 * Accessibility Provider Component
 * Wraps the application with accessibility features
 */
export const AccessibilityProvider = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};
