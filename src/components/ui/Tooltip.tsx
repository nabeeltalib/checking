import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({
  content,
  children,
  position = 'top',
  showDelay = 300,
  hideDelay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        let x = 0,
          y = 0;

        switch (position) {
          case 'top':
            x =
              triggerRect.left +
              triggerRect.width / 2 -
              tooltipRect.width / 2;
            y = triggerRect.top - tooltipRect.height - 10;
            break;
          case 'bottom':
            x =
              triggerRect.left +
              triggerRect.width / 2 -
              tooltipRect.width / 2;
            y = triggerRect.bottom + 10;
            break;
          case 'left':
            x = triggerRect.left - tooltipRect.width - 10;
            y =
              triggerRect.top +
              triggerRect.height / 2 -
              tooltipRect.height / 2;
            break;
          case 'right':
            x = triggerRect.right + 10;
            y =
              triggerRect.top +
              triggerRect.height / 2 -
              tooltipRect.height / 2;
            break;
          default:
            break;
        }

        // Ensure the tooltip stays within the viewport
        const { innerWidth, innerHeight } = window;
        if (x < 0) x = 10;
        if (x + tooltipRect.width > innerWidth) x = innerWidth - tooltipRect.width - 10;
        if (y < 0) y = 10;
        if (y + tooltipRect.height > innerHeight) y = innerHeight - tooltipRect.height - 10;

        setCoords({ x, y });
      }
    };

    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible, position]);

  const showTooltip = () => {
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setIsVisible(true), showDelay);
  };

  const hideTooltip = () => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), hideDelay);
  };

  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onTouchStart={showTooltip}
        onTouchEnd={hideTooltip}
        aria-describedby="tooltip"
      >
        {children}
      </div>
      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                left: coords.x,
                top: coords.y,
                zIndex: 9999,
                pointerEvents: 'none',
              }}
              className="bg-dark-4 text-light-1 px-2 py-1 rounded text-sm shadow-lg"
              id="tooltip"
              role="tooltip"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Tooltip;