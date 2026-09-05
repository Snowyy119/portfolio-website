/**
 * Centralized fix for environments that cannot drive animations — specifically
 * the VS Code Integrated Browser (Electron webview), where the page reports
 * `document.visibilityState === "hidden"` (and `document.hasFocus() === false`)
 * even while it is on screen, AND `requestAnimationFrame` never fires.
 *
 * Why this is needed:
 *   - Framer Motion's render/animation loop is driven entirely by
 *     requestAnimationFrame. In the Integrated Browser rAF never fires, so any
 *     element whose `initial` state hides it (opacity: 0, translateY, etc.) is
 *     stuck at its initial state forever.
 *   - CSS `@keyframes` reveal animations (e.g. the portfolio gallery items)
 *     also depend on compositor frames, which do not advance in that 0x0
 *     hidden webview, and their IntersectionObserver never reports an
 *     intersection. So those items stay at opacity: 0 as well.
 *
 *   `MotionConfig reducedMotion` does NOT fix either (it still needs a frame),
 *   and rAF/setTimeout shims are useless on their own because timers are only
 *     throttled, not dead.
 *
 * The fix (centralized in this module):
 *   1. Determine, as early as possible and reliably, whether this environment
 *      can drive animations:
 *        - a synchronous best-guess (is the page hidden?) so the FIRST paint is
 *          already in the safe state, and
 *        - an asynchronous requestAnimationFrame liveness probe (timers DO fire
 *          even when rAF is dead) to correct the guess in the "appears then
 *          freezes" case where the page is briefly visible at load and hidden
 *          just after.
 *   2. When the environment is broken:
 *        - every Framer Motion component renders with `initial={false}` so it
 *          paints its `animate` (final) state immediately — no frame required;
 *        - `useInView` reports `true` so in-view-based reveals resolve to their
 *          final state;
 *        - a `.motion-blocked` class is added to <html> so CSS-animation
 *          reveals (the gallery) also land in their final state.
 *
 * In a normal external browser the environment CAN drive animations, so this
 * module is a strict no-op: components are pass-throughs and every entrance
 * animation plays exactly as before.
 */

import * as FM from 'framer-motion';
import {
  createContext,
  createElement,
  forwardRef,
  Fragment,
  useContext,
  useEffect,
  useState,
} from 'react';

// ---------------------------------------------------------------------------
// Broken-environment detection
// ---------------------------------------------------------------------------

const canUseDOM =
  typeof window !== 'undefined' && typeof document !== 'undefined';

/** Synchronous best-guess: a page that is hidden cannot drive rAF. */
function initialIsHidden() {
  return canUseDOM && document.visibilityState === 'hidden';
}

const MotionEnvContext = createContext({ blocked: false });

/**
 * Provides a live `blocked` flag (true = "this environment cannot drive
 * animations, render everything in its final state").
 *
 * `blocked` is derived from two live signals:
 *   - the document visibilityState (a hidden page never runs rAF — guaranteed
 *     by spec), and
 *   - an rAF liveness check (covers the pathological case where the page is
 *     reported "visible" but requestAnimationFrame is still unavailable).
 *
 * The visibilityState is tracked *live* (initial read + visibilitychange event
 * + a polling interval as a fallback), because a headless/background webview can
 * flap between "visible" and "hidden". This removes the "appears then freezes"
 * race: the moment the page becomes hidden, blocked flips to true.
 */
export function MotionProvider({ children }) {
  const [hidden, setHidden] = useState(initialIsHidden);
  const [rafDead, setRafDead] = useState(false);
  const blocked = hidden || rafDead;

  // Track document.visibilityState live. The visibilitychange event fires even
  // in hidden tabs (it is not timer-throttled); the interval is a fallback for
  // webviews that skip it (timers still fire, just throttled, so state is
  // corrected within ~1s regardless).
  useEffect(() => {
    if (!canUseDOM) return;
    const sync = () => setHidden(document.visibilityState === 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    const id = setInterval(sync, 250);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      clearInterval(id);
    };
  }, []);

  // rAF liveness: in a healthy environment requestAnimationFrame fires within a
  // frame or two (<~16ms), well under the 1s window, so this never trips there.
  // If it never fires while the page is visible, rAF is unavailable -> block.
  useEffect(() => {
    if (!canUseDOM || hidden) return;
    let fired = false;
    let rafId = null;
    try {
      rafId = requestAnimationFrame(() => {
        fired = true;
        setRafDead(false);
      });
    } catch {
      rafId = null;
    }
    if (!rafId) setRafDead(true);
    const id = setTimeout(() => {
      if (!fired) setRafDead(true);
    }, 1000);
    return () => {
      clearTimeout(id);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hidden]);

  // Expose the state to CSS (gallery reveal) in addition to the components.
  useEffect(() => {
    if (!canUseDOM) return;
    document.documentElement.classList.toggle('motion-blocked', blocked);
  }, [blocked]);

  return createElement(MotionEnvContext.Provider, { value: { blocked } }, children);
}

// ---------------------------------------------------------------------------
// Framer Motion `motion` proxy
// ---------------------------------------------------------------------------

// A real Framer Motion component is a React forwardRef/memo object (it carries
// a `$$typeof` symbol). `motion.create` is a plain factory function (no
// `$$typeof`), so this check reliably distinguishes components from utilities.
function isMotionComponent(value) {
  return Boolean(value && value.$$typeof);
}

// Cache wrapped components so `motion.div` always returns the SAME component
// reference and React never remounts it.
const wrappedCache = new Map();

function wrapComponent(original, key) {
  const cached = wrappedCache.get(key);
  if (cached) return cached;

  const Wrapped = forwardRef((props, ref) => {
    const { blocked } = useContext(MotionEnvContext);
    const { initial, ...rest } = props;
    // When `blocked`, render with `initial={false}` so Framer Motion paints the
    // final (animate) state immediately — no frame required.
    //
    // `key` flips when `blocked` flips, which forces React to REMOUNT the element.
    // This is critical: Framer Motion only honors `initial` at mount time, and its
    // animation loop is driven by requestAnimationFrame (which is dead in the
    // Integrated Browser). In the "appears then freezes" race the page is briefly
    // visible at load (blocked=false, so FM mounts with its hidden `initial`), then
    // becomes hidden. A mere re-render with initial={false} does NOT reliably
    // repaint an already-mounted element to its final state — but a remount makes
    // FM read initial={false} fresh at mount and paint the final state.
    //
    // In a healthy browser `blocked` is stably false, so the key is stably
    // 'motion-live' and the element is never remounted — all entrance animations
    // play exactly as before.
    return createElement(original, {
      ...rest,
      ref,
      initial: blocked ? false : initial,
      key: blocked ? 'motion-blocked' : 'motion-live',
    });
  });
  Wrapped.displayName = 'MotionEnvFix';

  wrappedCache.set(key, Wrapped);
  return Wrapped;
}

export const motion = new Proxy(FM.motion, {
  get(target, key, receiver) {
    if (typeof key !== 'string') return Reflect.get(target, key, receiver);
    if (key === 'create' || key === 'default') {
      return Reflect.get(target, key, receiver);
    }
    const value = Reflect.get(target, key, receiver);
    return isMotionComponent(value) ? wrapComponent(value, key) : value;
  },
});

// ---------------------------------------------------------------------------
// Re-exports (identical API surface to `framer-motion`)
// ---------------------------------------------------------------------------

/**
 * `AnimatePresence` normally retains a child until its `exit` animation has
 * completed before removing it from the tree. In a broken environment
 * (the VS Code Integrated Browser) `requestAnimationFrame` never fires, so a
 * framer-motion `exit` animation can never complete — and the child (e.g. the
 * Lab lightbox) is held in the DOM forever, so it never visually closes.
 *
 * The fix: when the environment is blocked, render `children` directly so any
 * conditionally-rendered child unmounts immediately — matching the "final
 * state" model the `motion` proxy above already uses. In a healthy browser
 * `blocked` is false and we render the real framer-motion `AnimatePresence`,
 * so every existing exit animation plays exactly as before.
 */
function AnimatePresence({ children, ...props }) {
  const { blocked } = useContext(MotionEnvContext);
  if (blocked) {
    return createElement(Fragment, null, children);
  }
  return createElement(FM.AnimatePresence, props, children);
}
AnimatePresence.displayName = 'AnimatePresence';

export { AnimatePresence };
export const MotionConfig = FM.MotionConfig;

export function useInView(ref, options) {
  // In a broken environment treat elements as "in view" so in-view-based
  // reveals resolve to their final state instead of waiting on an
  // IntersectionObserver that will never report an intersection.
  const { blocked } = useContext(MotionEnvContext);
  const inView = FM.useInView(ref, options);
  return blocked ? true : inView;
}

export const useScroll = FM.useScroll;
export const useSpring = FM.useSpring;
export const useMotionValue = FM.useMotionValue;
export const useTransform = FM.useTransform;
export const useReducedMotion = FM.useReducedMotion;
export const useAnimation = FM.useAnimation;