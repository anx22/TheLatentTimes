---
name: gsap
description: Rules for animating with GSAP in this React (Vite) app — the project's single animation system (Framer Motion / `motion` has been removed). Use whenever adding or changing UI animation, especially typography reveals, scroll-driven motion, and micro-interactions.
---

# GSAP Animation Skill

GSAP is **the** animation layer for The Latent Times. Do not reintroduce Framer Motion / `motion`.
GSAP (incl. all plugins: SplitText, ScrollTrigger, Flip, etc.) is free since v3.13. Import named.

## Golden Rules (React 19 + Vite)

1. **Always scope and always clean up.** Use `gsap.context()` (or `useGSAP()` from `@gsap/react` if installed) inside `useEffect`/`useLayoutEffect`, and **revert on unmount**. A leaked timeline = duplicated tweens after re-render.
   ```tsx
   const root = useRef<HTMLDivElement>(null);
   useLayoutEffect(() => {
     const ctx = gsap.context(() => {
       gsap.from(".reveal", { yPercent: 20, opacity: 0, stagger: 0.06, ease: "power3.out" });
     }, root);
     return () => ctx.revert();      // MANDATORY cleanup
   }, []);
   return <div ref={root}>…</div>;
   ```
2. **Scope selectors to a ref, never global.** Selector strings inside `gsap.context(fn, rootRef)` only match within that root — prevents cross-component bleed in a multi-room UI.
3. **Animate transforms & opacity, not layout.** Prefer `x/y/xPercent/yPercent/scale/rotation/opacity`. Avoid animating `top/left/width/height` (reflow). Respect the grid: never animate `react-grid-layout` coordinates (see `grid-geometry` skill).
4. **Use `gsap.set` for initial state**, then animate — avoid first-frame flashes (FOUC). For entrance reveals prefer `.from()`.
5. **Typography reveals** (a North-Star priority): use **SplitText** to split into chars/words/lines, then stagger. Always `split.revert()` in cleanup, and re-split on resize/font-load. Keep a non-animated fallback for `prefers-reduced-motion`.
6. **Honor `prefers-reduced-motion`.** Wrap motion in `gsap.matchMedia()`; provide a reduced/no-op variant. Accessibility is not optional.
7. **One timeline per intent.** Build sequences with `gsap.timeline()` and labels rather than chained `setTimeout`/nested tweens. Kill timelines on unmount.
8. **ScrollTrigger:** register once (`gsap.registerPlugin(ScrollTrigger)`), create inside the scoped context, and let `ctx.revert()` kill triggers. Call `ScrollTrigger.refresh()` after async content/layout changes.
9. **Don't fight React.** GSAP mutates the DOM directly — animate refs/children, but never animate a node whose identity React will swap on the same tick. Keys stable, animations scoped.
10. **Performance:** batch with `stagger`, avoid per-frame React state updates from `onUpdate`; use `quickTo`/`quickSetter` for high-frequency (pointer-follow) micro-interactions.

## Project conventions
- Register plugins centrally (e.g., a small `lib/gsap.ts`) and import from there, so the plugin set is one source of truth.
- Entrance/reveal animations live next to their component, scoped by ref.
- If `@gsap/react` is available, prefer `useGSAP(() => {…}, { scope: root })` — it handles context + cleanup automatically.

## Anti-patterns (reject)
- Reintroducing `motion`/`framer-motion`. ❌
- Global selector tweens without a scope ref. ❌
- Missing `ctx.revert()` / `split.revert()` cleanup. ❌
- Animating layout properties or grid coordinates. ❌
- Ignoring `prefers-reduced-motion`. ❌
