import { Footer } from "./components/footer";
import { Analytics } from "./components/sections/analytics";
import { Api } from "./components/sections/api";
import { CTA } from "./components/sections/cta";
import { DeveloperFirst } from "./components/sections/developer-first";
import { Features } from "./components/sections/features";
import { Hero } from "./components/sections/hero";
import { Integrations } from "./components/sections/integrations";
import { Options } from "./components/sections/options";
import { Performance } from "./components/sections/performance";
import { Plugins } from "./components/sections/plugins";
import { QuickStart } from "./components/sections/quick-start";
import { Reliability } from "./components/sections/reliability";
import { page } from "./lib/styles";

// Defines every custom element used below before the first render.
import "./components/elements";

export function App() {
  return (
    <div className={page}>
      <scroll-progress />
      <site-navbar />
      <main>
        <Hero />
        <Features />
        <DeveloperFirst />
        <Analytics />
        <Performance />
        <Reliability />
        <Plugins />
        <frameworks-section />
        <QuickStart />
        <Options />
        <Api />
        <Integrations />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
