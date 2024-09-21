import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isInputFocused, setIsInputFocused] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsInputFocused(event.target.tagName === 'INPUT');
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsInputFocused(event.target.tagName !== 'INPUT');
  };

  // Disable drag listeners if the input is focused
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
