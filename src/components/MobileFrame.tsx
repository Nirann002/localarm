import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

// Native fullscreen wrapper - no phone frame for native app builds
const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="h-full w-full bg-background">
      {children}
    </div>
  );
};

export default MobileFrame;
