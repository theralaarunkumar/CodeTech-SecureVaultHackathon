import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

export const Card = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl border border-accent/20 bg-surface/50 backdrop-blur-sm text-text shadow-sm transition-all hover:border-accent/40",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
