import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';

export function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const [isInputFocused, setIsInputFocused] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFocus = (event: React.FocusEvent) => {
    if (event.target.tagName === 'INPUT') {
      setIsInputFocused(true);
    }
  };

  const handleBlur = (event: React.FocusEvent) => {
    if (event.target.tagName === 'INPUT') {
      setIsInputFocused(false);
    }
  };

  const enhancedListeners = isInputFocused ? {} : listeners;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...enhancedListeners}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              onFocus: handleFocus,
              onBlur: handleBlur,
            })
          : child
      )}
    </div>
  );
}
