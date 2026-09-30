import { Footer } from "./components/footer";
import { Features } from "./components/sections/features";
import { Hero } from "./components/sections/hero";
import { Workflow } from "./components/sections/workflow";
import { page } from "./lib/styles";

import "./components/elements";

export function App() {
  return (
    <div className={page}>
      <scroll-progress />
      <site-navbar />
      <main>
        <Hero />
        <site-showcase />
        <Features />
        <Workflow />
        <site-install />
        <site-faq />
      </main>
      <Footer />
    </div>
  );
}
