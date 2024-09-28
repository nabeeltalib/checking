// SortableItem.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';
import { X, GripVertical } from 'lucide-react'; // Ensure you have lucide-react installed
import { motion } from 'framer-motion';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onDelete: () => void; // Add onDelete prop
}

export function SortableItem({ id, children, onDelete }: SortableItemProps) {
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
    <div ref={setNodeRef} style={style} {...attributes} {...enhancedListeners} className="relative">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              onFocus: handleFocus,
              onBlur: handleBlur,
            })
          : child
      )}
      {/* Delete Button */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 focus:outline-none"
        aria-label="Delete item"
      >
        <X size={16} />
      </button>
    </div>
  );
}
