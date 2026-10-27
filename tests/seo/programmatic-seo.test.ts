import { describe, it, expect } from "vitest";
import {
  getProgrammaticMetadata,
  SPECIALTY_MAP,
  CITY_MAP,
} from "@/lib/seo/programmatic";
import { generateMetadata } from "@/app/[locale]/(public)/especialistas/[specialty]/[city]/page";

describe("Programmatic Specialty x City SEO (MKT-SEO-02)", () => {
  it("resolves specialty and city metadata in Spanish", () => {
    const meta = getProgrammaticMetadata("cardiologia", "cdmx", "es");
    expect(meta.specialty).toBe("Cardiología");
    expect(meta.city).toBe("Ciudad de México");
    expect(meta.title).toContain("Cardiología");
    expect(meta.title).toContain("Ciudad de México");
    expect(meta.canonicalUrl).toBe("https://www.quhealthy.org/es/especialistas/cardiologia/cdmx");
  });

  it("resolves specialty and city metadata in English", () => {
    const meta = getProgrammaticMetadata("dermatologia", "guadalajara", "en");
    expect(meta.specialty).toBe("Dermatology");
    expect(meta.city).toBe("Guadalajara");
    expect(meta.title).toContain("Dermatology");
    expect(meta.canonicalUrl).toBe("https://www.quhealthy.org/en/especialistas/dermatologia/guadalajara");
  });

  it("generates full Next.js Metadata with alternates and openGraph", async () => {
    const params = Promise.resolve({
      locale: "es",
      specialty: "pediatria",
      city: "monterrey",
    });

    const metadata = await generateMetadata({ params });

    expect(metadata.title).toContain("Pediatría");
    expect(metadata.title).toContain("Monterrey");
    expect(metadata.alternates?.canonical).toBe(
      "https://www.quhealthy.org/es/especialistas/pediatria/monterrey"
    );
    expect(metadata.openGraph?.url).toBe(
      "https://www.quhealthy.org/es/especialistas/pediatria/monterrey"
    );
  });

  it("covers all target top specialties and cities without missing entries", () => {
    expect(Object.keys(SPECIALTY_MAP).length).toBeGreaterThanOrEqual(6);
    expect(Object.keys(CITY_MAP).length).toBeGreaterThanOrEqual(5);

    expect(SPECIALTY_MAP["cardiologia"].es).toBe("Cardiología");
    expect(CITY_MAP["cdmx"].es).toBe("Ciudad de México");
  });
});
