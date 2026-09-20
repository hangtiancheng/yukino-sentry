// The JSX runtime resolves a tag through `window.customElements` first and
// silently falls back to the registry's `<div>` when the element is not yet
// defined — an un-imported custom element swallows its whole subtree.
// Importing this module defines every element the app renders.
import "./motion/enter-effect";
import "./motion/loop-effect";
import "./motion/reveal";
import "./motion/scroll-progress";
import "./navbar";
import "./sections/frameworks";
import "./ui/code-block";
