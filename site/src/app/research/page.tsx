import type { Metadata } from "next";
import Image from "next/image";
import { ZoomImage } from "@/components/zoom-image";
import Link from "next/link";
import dynamic from "next/dynamic";
import BVEXCarousel from "@/components/bvex-carousel";

// Lazy load VLBI background
const VLBIBackground = dynamic(() => import("@/components/vlbi-background"), {
  loading: () => null,
});

export const metadata: Metadata = {
  title: "Research",
  description:
    "Balloon-borne high-frequency VLBI instrumentation, polarization studies of star-forming cores, and RFSoC tone tracking for MKIDs at CCAT Prime.",
  keywords: [
    "VLBI instrumentation research",
    "balloon-borne black hole imaging",
    "high-frequency VLBI systems",
    "RFSoC tone tracking",
    "MKIDs",
    "CCAT Prime",
    "star formation polarization",
    "BVEX project",
    "radio astronomy instrumentation",
    "photon ring detection",
    "millimeter wave astronomy",
    "balloon-borne astronomy"
  ],
  openGraph: {
    title: "Research - Mayukh Bagchi | VLBI Instrumentation & Black Hole Imaging",
    description:
      "Balloon-borne VLBI, polarization studies of dense cores, and RFSoC tone tracking at CCAT Prime.",
    type: "website",
    url: "https://mayukhbagchi.com/research",
    images: [
      {
        url: "https://mayukhbagchi.com/research/BVEX/BVEX.webp",
        width: 1200,
        height: 630,
        alt: "BVEX - Balloon-borne VLBI Experiment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research - Mayukh Bagchi | VLBI Instrumentation",
    description: "Balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies.",
    images: ["https://mayukhbagchi.com/research/BVEX/BVEX.webp"],
  },
  alternates: {
    canonical: "https://mayukhbagchi.com/research",
  },
};

type TermProject = {
  title: string;
  pdf: string;
  thumb: string;
};

const TERM_PROJECTS: TermProject[] = [
  {
    title: "Star Formation — Dust Polarization",
    pdf: "/research/PHY509_Term_Project.pdf",
    thumb: "/research/project_1_star_formation_dust_polarization_mayukh.webp",
  },
  {
    title: "Structure of a Neutron Star",
    pdf: "/research/PHY_815_The-structure-of-a-Neutron-Star-and-how-to-find-it_Mayukh.pdf",
    thumb: "/research/project_2_structure_of_neutron_star.webp",
  },
  {
    title: "Peering into High-Velocity Clouds",
    pdf: "/research/Peering_into_HVC__PHY_845_Mayukh.pdf",
    thumb: "/research/project_3_high_velocity_clouds_mayukh.webp",
  },
  {
    title: "Kerr Metric — Geodesics and Shadows",
    pdf: "/research/PHY_823_Term_Project_Mayukh-2.pdf",
    thumb: "/research/project_4_kerr_metric_mayukh.webp",
  },
  {
    title: "Electromagnetic Waves in Schwarzschild Spacetime",
    pdf: "/research/PHY_832_Term_Project.pdf",
    thumb: "/research/project_5_electromagnetic_wave_dynamics_in_swarzchild_space_time_Mayukh.png",
  },
];

export default function ResearchPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <VLBIBackground mode="research" />
      <section className="relative z-10 space-y-10">
        <header>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Research</h1>
          <p className="mt-3 text-foreground/80 max-w-3xl">
            Building balloon‑borne high‑frequency VLBI instruments, studying polarization in
            star‑forming cores, and developing RFSoC tone‑tracking techniques for MKID arrays.
          </p>
        </header>

        {/* Thesis highlight */}
        <section className="rounded-2xl border border-[hsl(var(--muted)/0.18)] bg-transparent overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <Link
              href="https://qspace.library.queensu.ca/items/a035a019-abe2-4d8d-a5f6-69f55f1f4242"
              target="_blank"
              rel="noreferrer"
              className="group relative block w-full h-[360px] md:h-[520px] lg:h-[560px]"
            >
              <Image
                src="/research/Mayukh_Bagchi_MSc_thesis_cover_page.webp"
                alt="MSc Thesis cover — Advances in Microwave and Sub-mm Astronomical Instrumentation and Analysis"
                width={1200}
                height={1600}
                className="w-full h-full object-contain p-4 md:p-6 transition-transform duration-500 group-hover:scale-[1.01]"
                priority
              />
              <span className="sr-only">Open thesis</span>
            </Link>
            <div className="p-6 md:p-8 flex flex-col justify-center md:border-l border-[hsl(var(--muted)/0.18)] bg-[hsl(var(--background)/0.03)]">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Master's Thesis</h2>
              <p className="mt-3 text-foreground/80">
                Mm/sub‑mm instrumentation for star formation and black hole science, polarization
                stacking in dense cores, CCAT Prime atmospheric sensitivity, and a balloon‑borne VLBI
                pathfinder (BVEX) using RFSoC boards.
              </p>
              <div className="mt-5">
                <Link
                  href="https://qspace.library.queensu.ca/items/a035a019-abe2-4d8d-a5f6-69f55f1f4242"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.06)] px-4 py-2 text-sm hover:bg-[hsl(var(--background)/0.1)] transition-colors"
                >
                  Read the thesis
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Current Project — BVEX */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Current project</h2>
            <p className="text-foreground/70">BVEX — Balloon‑borne VLBI Experiment</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            <BVEXCarousel />
            <div className="relative rounded-2xl border p-6 md:p-7 flex items-center border-[hsl(var(--muted)/0.18)] bg-[hsl(var(--background)/0.03)] hover:bg-[hsl(var(--background)/0.06)] transition-colors">
              <div>
                <p className="text-foreground/85">
                  A 1 m single‑dish balloon platform at K‑band (22 GHz) to obtain simultaneous VLBI
                  fringes with a ground telescope — pushing angular resolution pathways beyond current
                  limits.
                </p>
                <ul className="mt-4 space-y-2 text-foreground/80 text-sm list-disc pl-5">
                  <li>IF stage and backend readout architecture</li>
                  <li>Timing reference and position reconstruction</li>
                  <li>High‑speed RFSoC 4x2 FPGA data path</li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="https://www.queensu.ca/bvex/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.06)] px-4 py-2 text-sm hover:bg-[hsl(var(--background)/0.1)] transition-colors"
                  >
                    <svg aria-hidden className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" x2="21" y1="14" y2="3"/>
                    </svg>
                    Official BVEX Website
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Past projects */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Past projects</h2>
          <div className="grid grid-cols-1 gap-6">
            {/* Star formation polarization */}
            <div className="rounded-2xl border overflow-hidden border-[hsl(var(--muted)/0.18)] bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-full grid grid-rows-2 gap-2 p-2">
                  <ZoomImage
                    src="/research/star_formation_JCMT.webp"
                    width={900}
                    height={700}
                    alt="JCMT — Star formation polarization maps"
                    className="relative h-full rounded-xl overflow-hidden bg-[hsl(var(--background)/0.04)]"
                  />
                  <ZoomImage
                    src="/research/star_formation_Polarization_TMC.webp"
                    width={900}
                    height={700}
                    alt="Polarization in the Taurus Molecular Cloud"
                    className="relative h-full rounded-xl overflow-hidden bg-[hsl(var(--background)/0.04)]"
                  />
                </div>
                <div className="p-6 md:p-8 flex items-center md:border-l border-[hsl(var(--muted)/0.18)] bg-[hsl(var(--background)/0.03)] hover:bg-[hsl(var(--background)/0.06)] transition-colors">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Polarization in dense cores</h3>
                    <p className="mt-3 text-foreground/80 text-justify">
                      Magnetic fields are thought to play a crucial role in star formation by providing
                      support against the gravitational collapse of dense clumps of gas, called cores,
                      which are precursors to individual stellar systems. Polarized thermal radiation
                      from aligned dust grains is an essential tool for studying magnetic fields within
                      star‑forming cores. However, the aligning radiation from the local interstellar
                      field may be attenuated by the large dust column surrounding these dense cores.
                    </p>
                    <p className="mt-3 text-foreground/80 text-justify">
                      The central question is: <em>are dust grains aligned within the cores?</em> If so,
                      polarization maps can be used to trace the core‑scale magnetic fields. Studying
                      different stages of core evolution also reveals how well grains remain aligned at
                      each stage—for example, a luminous protostar at the center could provide the
                      alignment torque needed to maintain grain alignment.
                    </p>
                    <p className="mt-3 text-foreground/80 text-justify">
                      I analyze JCMT observations and apply stacking analysis to filtered snapshots of
                      individual stellar cores to improve the signal‑to‑noise. The goal is to extend this
                      method to higher‑resolution (~5″) data from upcoming surveys such as TolTEC Fields
                      in Filaments. For more details, see my MSc thesis
                      {" "}
                      <Link
                        href="https://qspace.library.queensu.ca/items/a035a019-abe2-4d8d-a5f6-69f55f1f4242"
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline underline-offset-4"
                      >
                        here
                      </Link>
                      .
                    </p>
                    <div className="mt-4">
                      <Link
                        href="https://github.com/mayukh4/Dust_polarization_data"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.06)] px-3 py-2 text-sm hover:bg-[hsl(var(--background)/0.1)] transition-colors"
                      >
                        <svg aria-hidden className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.11.79-.25.79-.56l-.01-2.02c-3.22.7-3.9-1.55-3.9-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.72 1.26 3.39.97.11-.76.41-1.26.74-1.55-2.57-.29-5.27-1.29-5.27-5.75 0-1.27.46-2.31 1.21-3.12-.12-.3-.52-1.51.11-3.14 0 0 .98-.31 3.21 1.19.93-.26 1.93-.39 2.92-.4.99 0 1.99.14 2.92.4 2.23-1.5 3.21-1.19 3.21-1.19.63 1.63.23 2.84.11 3.14.75.81 1.21 1.85 1.21 3.12 0 4.47-2.71 5.45-5.29 5.74.42.36.79 1.07.79 2.16l-.01 3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"/>
                        </svg>
                        <span>Dust Polarization Data (GitHub)</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RFSoC tone tracking and CCAT */}
            <div className="rounded-2xl border overflow-hidden border-[hsl(var(--muted)/0.18)] bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-full grid grid-rows-2 gap-2 p-2">
                  <ZoomImage
                    src="/research/Rfsoc_tone_tracking_CCAT_research.webp"
                    width={900}
                    height={700}
                    alt="RFSoC tone tracking — spectrometer"
                    className="relative h-full rounded-xl overflow-hidden bg-[hsl(var(--background)/0.04)]"
                  />
                  <ZoomImage
                    src="/research/CCAT_atmospheric_characterization.png"
                    width={900}
                    height={700}
                    alt="CCAT Prime atmospheric characterization"
                    className="relative h-full rounded-xl overflow-hidden bg-[hsl(var(--background)/0.04)]"
                  />
                </div>
                <div className="p-6 md:p-8 flex items-center md:border-l border-[hsl(var(--muted)/0.18)] bg-[hsl(var(--background)/0.03)] hover:bg-[hsl(var(--background)/0.06)] transition-colors">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Atmospheric characterization and MKID tone tracking for CCAT‑Prime</h3>
                    <p className="mt-3 text-foreground/80 text-justify">
                      CCAT‑Prime is a 6 m telescope under construction at 5600 m on Cerro Chajnantor in
                      the Atacama Desert of northern Chile. The extremely dry conditions enable
                      excellent millimeter and sub‑millimeter observations. The Prime‑Cam instrument will
                      operate at 1.1 mm, 0.85 mm, and 0.35 mm and can employ next‑generation MKID
                      detectors, which offer a simpler readout than TES arrays. Incoming photons break
                      Cooper pairs in the superconducting resonators, shifting the inductance; by
                      injecting a probe tone into each resonator, we track the frequency shift and
                      thereby recover the signal strength.
                    </p>
                    <p className="mt-3 text-foreground/80 text-justify">
                      I am characterizing the atmosphere at the CCAT site to inform robust
                      tone‑tracking strategies for MKID readout. Using Scott Paine’s Atmospheric
                      Modeling (AM) package, I simulate monthly conditions at the site. With skydip
                      simulations—how detector power changes as the telescope slews between
                      elevations—I estimate retuning cadence and target responsivities. Based on these
                      results, I am developing a tone‑tracking algorithm on modern Xilinx RFSoC FPGAs.
                      For additional context, see my MSc thesis
                      {" "}
                      <Link
                        href="https://qspace.library.queensu.ca/items/a035a019-abe2-4d8d-a5f6-69f55f1f4242"
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline underline-offset-4"
                      >
                        here
                      </Link>
                      .
                    </p>
                    <div className="mt-4">
                      <Link
                        href="https://github.com/mayukh4/CCAT-P-Atmospheric-Modelling"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.06)] px-3 py-2 text-sm hover:bg-[hsl(var(--background)/0.1)] transition-colors"
                      >
                        <svg aria-hidden className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.11.79-.25.79-.56l-.01-2.02c-3.22.7-3.9-1.55-3.9-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.72 1.26 3.39.97.11-.76.41-1.26.74-1.55-2.57-.29-5.27-1.29-5.27-5.75 0-1.27.46-2.31 1.21-3.12-.12-.3-.52-1.51.11-3.14 0 0 .98-.31 3.21 1.19.93-.26 1.93-.39 2.92-.4.99 0 1.99.14 2.92.4 2.23-1.5 3.21-1.19 3.21-1.19.63 1.63.23 2.84.11 3.14.75.81 1.21 1.85 1.21 3.12 0 4.47-2.71 5.45-5.29 5.74.42.36.79 1.07.79 2.16l-.01 3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"/>
                        </svg>
                        <span>CCAT‑P Atmospheric Modelling (GitHub)</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Past term projects */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Past term projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TERM_PROJECTS.map((p) => (
              <Link
                key={p.pdf}
                href={p.pdf}
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl overflow-hidden border border-[hsl(var(--muted)/0.18)] bg-[hsl(var(--background)/0.03)] hover:bg-[hsl(var(--background)/0.06)] transition-colors"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={p.thumb}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-foreground/90">{p.title}</h3>
                  <p className="mt-1 text-xs text-foreground/60">PDF — opens in a new tab</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

