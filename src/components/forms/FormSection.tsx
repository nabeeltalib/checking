import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Info, ChevronUp, ChevronDown } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/Tooltip";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  tooltip: string;
  isExpandable?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title, 
  children, 
  tooltip, 
  isExpandable = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isExpandable) return;
    setIsExpanded(!isExpanded);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <motion.div
      layout
      ref={sectionRef}
      className="bg-dark-2 p-6 rounded-xl shadow-lg border border-gray-800 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`flex items-center justify-between mb-6 ${
          isExpandable ? 'cursor-pointer hover:opacity-80' : ''
        }`}
        onClick={handleToggle}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="text-xl font-light text-light-1 flex items-center group">
                {title}
                <Info 
                  size={16} 
                  className="ml-2 text-light-3 opacity-60 group-hover:opacity-100 transition-opacity" 
                />
              </h2>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isExpandable && (
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className="text-light-2 hover:bg-dark-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </motion.div>
          </Button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {(!isExpandable || isExpanded) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
