// MotionSwitch.tsx
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./MotionSwitch.css";
import { v4 as uuidv4 } from "uuid";

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

type Size = "sm" | "md" | "lg";

export type MotionSwitchProps = {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (next: boolean) => void;
    disabled?: boolean;
    size?: Size;
    id?: string;
    name?: string;
    label?: React.ReactNode;
    className?: string;
    ariaLabel?: string;
};

const SIZE_TRANSLATE_X: Record<Size, number> = {
    sm: 16, // 36(track) - 16(knob) - 4(padding)
    md: 20, // 44 - 20 - 4
    lg: 28, // 56 - 24 - 4
};

/**
 * Accessible, animated Switch with plain CSS + Framer Motion.
 * - Controlled or uncontrolled
 * - Keyboard accessible (Space, Enter, ArrowLeft/ArrowRight)
 * - Respects prefers-reduced-motion
 */
const MotionSwitch = React.forwardRef<HTMLButtonElement, MotionSwitchProps>(
    ({ checked, defaultChecked, onCheckedChange, disabled = false, size = "md", id, name, label, className, ariaLabel }, ref) => {
        const isControlled = typeof checked === "boolean";
        const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked ?? false);
        const isOn = isControlled ? (checked as boolean) : internalChecked;

        const reduceMotion = useReducedMotion();
        const switchId = id ?? uuidv4();

        const setOn = (next: boolean) => {
            if (disabled) return;
            if (!isControlled) setInternalChecked(next);
            onCheckedChange?.(next);
        };

        const toggle = () => setOn(!isOn);

        const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (disabled) return;
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (isOn) setOn(false);
            }
            if (e.key === "ArrowRight") {
                e.preventDefault();
                if (!isOn) setOn(true);
            }
        };

        const translateX = SIZE_TRANSLATE_X[size];

        return (
            <div className={cx("msw-root", disabled && "is-disabled")}>
                <button
                    ref={ref}
                    type="button"
                    id={switchId}
                    name={name}
                    role="switch"
                    aria-checked={isOn}
                    aria-label={ariaLabel}
                    disabled={disabled}
                    onClick={toggle}
                    onKeyDown={onKeyDown}
                    className={cx("msw", size === "md" ? "msw-md" : size === "lg" ? "msw-lg" : "msw-sm", isOn && "is-on", disabled && "is-disabled", className)}
                >
                    <span aria-hidden className={cx("msw-track-grad", isOn && "is-on")} />

                    <motion.span
                        aria-hidden
                        className="msw-knob"
                        animate={{ x: isOn ? translateX : 0 }}
                        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 700, damping: 35 }}
                    />
                </button>

                {label ? (
                    <label
                        htmlFor={switchId}
                        className={cx("msw-label text-lg md:text-xl lg:text-2xl mb-0", disabled ? "is-disabled" : undefined)}
                        onClick={(e) => {
                            e.preventDefault();
                            toggle();
                        }}
                    >
                        {label}
                    </label>
                ) : null}
            </div>
        );
    }
);
MotionSwitch.displayName = "MotionSwitch";

export default MotionSwitch;

// --- Demo Usage --- //
export function MotionSwitchDemo() {
    const [enabled, setEnabled] = React.useState(false);
    const [enabledLg, setEnabledLg] = React.useState(true);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MotionSwitch label="Notifications" checked={enabled} onCheckedChange={setEnabled} />
                <span className="msw-note">State: {enabled ? "on" : "off"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MotionSwitch size="lg" label="Mode Pro" checked={enabledLg} onCheckedChange={setEnabledLg} />
                <span className="msw-note">State: {enabledLg ? "on" : "off"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MotionSwitch size="sm" defaultChecked disabled label="Disabled (sm)" />
            </div>
        </div>
    );
}
