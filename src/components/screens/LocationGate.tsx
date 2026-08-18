import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type GateState = "checking" | "prompt" | "denied" | "unavailable" | "granted";

interface LocationGateProps {
  onGranted: () => void;
}

const LocationGate = ({ onGranted }: LocationGateProps) => {
  const [state, setState] = useState<GateState>("checking");

  const verify = useCallback(
    (interactive: boolean) => {
      if (!("geolocation" in navigator)) {
        setState("unavailable");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          setState("granted");
          onGranted();
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) setState("denied");
          else setState(interactive ? "denied" : "prompt");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    },
    [onGranted]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!("geolocation" in navigator)) {
        setState("unavailable");
        return;
      }
      try {
        const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
        if (cancelled) return;
        if (status) {
          if (status.state === "granted") {
            verify(false);
          } else {
            setState("prompt");
          }
          status.onchange = () => {
            if (status.state === "granted") verify(false);
            else if (status.state === "denied") setState("denied");
          };
          return;
        }
      } catch {
        /* Permissions API unavailable (iOS Safari) */
      }
      setState("prompt");
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [verify]);

  const copy: Record<Exclude<GateState, "granted">, { title: string; body: string; cta: string }> = {
    checking: {
      title: "Checking location…",
      body: "Making sure we can track your journey.",
      cta: "Checking",
    },
    prompt: {
      title: "Location required",
      body: "LocAlarm only works with live location. Allow access so we can wake you at your stop.",
      cta: "Enable location",
    },
    denied: {
      title: "Location is turned off",
      body: "Turn location on for LocAlarm in your phone settings (and make sure GPS is enabled), then try again.",
      cta: "Try again",
    },
    unavailable: {
      title: "Location not supported",
      body: "This device or browser can't share location, so the alarm can't work here.",
      cta: "Try again",
    },
  };

  if (state === "granted") return null;
  const text = copy[state];

  return (
    <div
      className="h-full flex flex-col items-center justify-center bg-background px-8 text-center"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 2rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
      }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {state === "checking" ? (
          <Loader2 className="w-11 h-11 text-primary animate-spin" strokeWidth={1.5} />
        ) : state === "denied" ? (
          <Settings className="w-11 h-11 text-primary" strokeWidth={1.5} />
        ) : (
          <MapPin className="w-11 h-11 text-primary" strokeWidth={1.5} />
        )}
      </motion.div>

      <h1 className="text-2xl font-bold text-foreground mb-3">{text.title}</h1>
      <p className="text-muted-foreground mb-10 max-w-xs">{text.body}</p>

      <Button
        className="w-full max-w-xs h-14 text-lg"
        size="lg"
        disabled={state === "checking"}
        onClick={() => {
          setState("checking");
          verify(true);
        }}
      >
        {text.cta}
      </Button>
    </div>
  );
};

export default LocationGate;
