import { useSnapshot } from "@/lib/snapshot";
import { Header } from "@/components/header";
import { Webcam } from "@/components/webcam";
import { Conditions } from "@/components/conditions";
import { Trends } from "@/components/trends";
import { SnotelSection } from "@/components/snotel-section";
import { ForecastSection } from "@/components/forecast-section";
import { Footer } from "@/components/footer";

export default function App() {
  const { snapshot, error } = useSnapshot();

  return (
    <main className="min-h-screen pb-4">
      <Header />
      <Webcam />
      {error && snapshot === null ? (
        <section className="mx-auto w-full max-w-5xl px-5 pt-12">
          <p className="font-mono text-xs text-(--fg-2)">
            The station data feed is not answering right now. The camera and
            forecast above and below are unaffected.
          </p>
        </section>
      ) : (
        <>
          <Conditions snapshot={snapshot} />
          <Trends snapshot={snapshot} />
        </>
      )}
      <SnotelSection />
      <ForecastSection />
      <Footer />
    </main>
  );
}
