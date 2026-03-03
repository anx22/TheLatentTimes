import React, { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

interface GridBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: React.CSSProperties;
  className?: string;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  children?: React.ReactNode;
  title?: string;
}

export const GridBlock = forwardRef<HTMLDivElement, GridBlockProps>(
  ({ style, className, onMouseDown, onMouseUp, onTouchEnd, children, title, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col group relative",
          className
        )}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...props}
      >
        {/* Header / Drag Handle */}
        <div className="h-6 bg-zinc-100 border-b border-zinc-200 flex items-center px-2 cursor-move select-none group-hover:bg-zinc-200 transition-colors">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate">
            {title || "Untitled Block"}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-hidden">
          {children}
        </div>

        {/* Resize Handle Indicator (Visual Only - RGL handles the actual interaction) */}
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-zinc-300 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }
);

GridBlock.displayName = 'GridBlock';
