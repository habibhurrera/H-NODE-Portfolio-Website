import { create } from "zustand";

/* ═══════════════════════════════════════════════════════════════
   H-NODE PORTFOLIO — Global State Manager
   ───────────────────────────────────────────────────────────────
   Controls the entire application state machine:
   
   BOOT → HERO (3D H-NODE) → CONTENT (section revealed)
   
   States:
   - phase: "boot" | "hero" | "content"
   - activeSection: null | "about" | "projects" | "services" | "contact"
   - bootComplete: false → true (after terminal sequence)
   - heroReady: false → true (after 3D scene loads)
   - isTransitioning: lock during GSAP animations
═══════════════════════════════════════════════════════════════ */

const useStore = create((set, get) => ({
  /* ─── Phase Control ─── */
  phase: "boot", // "boot" | "hero" | "content"
  activeSection: null, // which content section is visible
  previousSection: null, // for back-navigation tracking

  /* ─── Status Flags ─── */
  bootComplete: false,
  heroReady: false,
  isTransitioning: false,

  /* ─── 3D Scene State ─── */
  hoveredNode: null, // which H-NODE sphere is hovered
  clickedNode: null, // which node was clicked (triggers animation)

  /* ─── Actions ─── */

  // Boot sequence finished → transition to hero
  completeBoot: () =>
    set({
      bootComplete: true,
      phase: "hero",
    }),

  // 3D scene has loaded and is ready
  setHeroReady: () => set({ heroReady: true }),

  // User hovers a node on the H-NODE
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),

  // User clicks a node → triggers GSAP routing animation
  navigateToSection: (sectionId) => {
    const state = get();
    if (state.isTransitioning) return; // prevent double-clicks

    set({
      isTransitioning: true,
      clickedNode: sectionId,
      previousSection: state.activeSection,
    });

    // The actual phase transition happens after GSAP animation completes
    // This is called by the animation's onComplete callback
  },

  // Called by GSAP onComplete → actually show the content
  revealContent: (sectionId) =>
    set({
      phase: "content",
      activeSection: sectionId,
      isTransitioning: false,
      clickedNode: null,
    }),

  // "← Disconnect" button → return to 3D hero view
  disconnectToHero: () => {
    const state = get();
    if (state.isTransitioning) return;

    set({
      isTransitioning: true,
    });

    // Again, the GSAP animation handles the visual transition
    // and calls completeDisconnect when done
  },

  // Called by GSAP onComplete when returning to hero
  completeDisconnect: () =>
    set({
      phase: "hero",
      activeSection: null,
      previousSection: null,
      isTransitioning: false,
      clickedNode: null,
      hoveredNode: null,
    }),

  // Direct phase set (for edge cases)
  setPhase: (phase) => set({ phase }),
  setTransitioning: (val) => set({ isTransitioning: val }),
}));

export default useStore;
