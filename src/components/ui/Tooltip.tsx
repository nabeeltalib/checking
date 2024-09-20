import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipContextType {
  isVisible: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const showTooltip = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setIsVisible(true), 300);
  };

  const hideTooltip = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), 100);
  };

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ isVisible, showTooltip, hideTooltip, triggerRef }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children, asChild }) => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('TooltipTrigger must be used within a TooltipProvider');

  const { showTooltip, hideTooltip, triggerRef } = context;

  const triggerProps = {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
    onTouchStart: showTooltip,
    onTouchEnd: hideTooltip,
    ref: triggerRef,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, triggerProps);
  }

  return <div {...triggerProps}>{children}</div>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('TooltipContent must be used within a TooltipProvider');

  const { isVisible, triggerRef } = context;
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [isVisible]);

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-dark-4 text-light-1 px-2 py-1 rounded text-sm shadow-lg fixed z-50 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
          }}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

export default Tooltip;