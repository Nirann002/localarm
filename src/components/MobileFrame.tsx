import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-[390px] h-[844px] bg-background rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-foreground/10">
        {/* Status bar */}
        <div className="h-12 px-6 flex items-center justify-between bg-background">
          <span className="text-sm font-medium text-muted-foreground">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 rounded-sm bg-foreground/60" />
            <div className="w-4 h-2 rounded-sm bg-foreground/60" />
            <div className="w-6 h-3 rounded-sm bg-foreground/60" />
          </div>
        </div>
        
        {/* Content area */}
        <div className="h-[calc(100%-48px-34px)] overflow-hidden">
          {children}
        </div>
        
        {/* Home indicator */}
        <div className="h-[34px] flex items-center justify-center bg-background">
          <div className="w-32 h-1 bg-foreground/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
