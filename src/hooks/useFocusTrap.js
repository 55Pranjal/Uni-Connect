import { useEffect } from "react";

/**
 * Trap keyboard focus inside the element referenced by `ref`, and restore it
 * to whatever was focused before the modal opened when the modal unmounts.
 *
 * Also wires up Escape → onClose. Pass onClose as the second arg; omit it
 * if the modal explicitly doesn't want Escape-to-close (rare).
 *
 *   const ref = useRef(null);
 *   useFocusTrap(ref, onClose);
 *   return <div className="fixed inset-0 ..."><div ref={ref}>…</div></div>;
 *
 * Tab cycles forward, Shift+Tab cycles backward. Focus only enters elements
 * that are tab-stoppable (buttons, inputs, links, [tabindex]). Disabled and
 * tabindex="-1" elements are skipped.
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const useFocusTrap = (ref, onClose, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement;

    // Focus first focusable child on mount; fall back to the container itself
    // so keyboard users aren't stuck at the page root.
    const focusables = node.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      node.setAttribute("tabindex", "-1");
      node.focus();
    }

    const handleKey = (e) => {
      if (e.key === "Escape" && typeof onClose === "function") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const list = node.querySelectorAll(FOCUSABLE_SELECTOR);
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [ref, onClose, enabled]);
};

export default useFocusTrap;
