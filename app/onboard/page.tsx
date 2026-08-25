"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ScanLine, Edit3, CheckCircle2, ArrowRight, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Tilt from "@/components/shared/tilt";
import Reveal from "@/components/shared/reveal";

export default function OnboardPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<"ocr" | "manual">("ocr");
  const [usn, setUsn] = useState("");
  const [name, setName] = useState("");
  const [pfpUrl, setPfpUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSimulatedOCR = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanned(true);
      setUsn("1BM24CS001");
      setName("Campus Student");
      setPfpUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300");
    }, 1800);
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usn.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usn, name, image: pfpUrl }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch {
      // Fallback redirect
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="grain relative min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Reveal>
          <div className="text-center space-y-3">
            <span className="sticker inline-block bg-limepop px-4 py-1 text-xs font-bold uppercase tracking-widest text-ink border-2 border-ink shadow-[2px_2px_0_var(--color-ink)]">
              Profile Setup
            </span>
            <h1 className="display text-4xl sm:text-6xl text-ink">
              Welcome to Eventlify
            </h1>
            <p className="text-sm sm:text-base text-ink/80 max-w-lg mx-auto font-medium">
              Choose how you want to set up your profile details. Your USN will be auto-filled for all future event registrations.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Tilt max={6}>
            <button
              type="button"
              onClick={() => setSelectedMethod("ocr")}
              className={`w-full text-left p-6 rounded-2xl border-2 border-ink transition-all ${
                selectedMethod === "ocr"
                  ? "bg-zest shadow-[4px_4px_0_var(--color-ink)] scale-[1.02]"
                  : "bg-white shadow-[2px_2px_0_var(--color-ink)] hover:bg-paper"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border-2 border-ink bg-white p-3 text-ink">
                  <ScanLine className="size-6 text-grape" />
                </div>
                <div>
                  <h3 className="display text-xl">Option A: AI OCR Scan</h3>
                  <p className="text-xs text-ink/70 font-semibold mt-0.5">
                    Scan Student ID Card automatically
                  </p>
                </div>
              </div>
            </button>
          </Tilt>

          <Tilt max={6}>
            <button
              type="button"
              onClick={() => setSelectedMethod("manual")}
              className={`w-full text-left p-6 rounded-2xl border-2 border-ink transition-all ${
                selectedMethod === "manual"
                  ? "bg-limepop shadow-[4px_4px_0_var(--color-ink)] scale-[1.02]"
                  : "bg-white shadow-[2px_2px_0_var(--color-ink)] hover:bg-paper"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border-2 border-ink bg-white p-3 text-ink">
                  <Edit3 className="size-6 text-punch" />
                </div>
                <div>
                  <h3 className="display text-xl">Option B: Manual Entry</h3>
                  <p className="text-xs text-ink/70 font-semibold mt-0.5">
                    Type your USN & upload photo manually
                  </p>
                </div>
              </div>
            </button>
          </Tilt>
        </div>

        <Reveal>
          <div className="rounded-2xl border-2 border-ink bg-white p-6 sm:p-8 shadow-[6px_6px_0_var(--color-ink)] space-y-6">
            {selectedMethod === "ocr" ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-ink/40 rounded-xl p-8 text-center bg-paper/50 space-y-4">
                  <UploadCloud className="mx-auto size-12 text-grape" />
                  <div>
                    <p className="font-bold text-ink text-sm sm:text-base">
                      Upload your physical Student ID Card
                    </p>
                    <p className="text-xs text-ink/60 mt-1">
                      Supports JPG, PNG up to 5MB. Python AI will crop face & extract USN.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSimulatedOCR}
                    disabled={isScanning}
                    className="bg-grape text-white hover:bg-grape/90 border-2 border-ink"
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-4 animate-spin-slow" />
                        Scanning ID Card with AI...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ScanLine className="size-4" />
                        Scan ID Card Now
                      </span>
                    )}
                  </Button>
                </div>

                {scanned && (
                  <div className="rounded-xl border-2 border-ink bg-mint p-4 flex items-center justify-between animate-pop-in">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-6 text-ink" />
                      <div>
                        <p className="font-bold text-sm text-ink">ID Card Scanned Successfully!</p>
                        <p className="text-xs text-ink/80">Extracted USN: <strong className="font-extrabold">{usn}</strong></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manual-usn">University Seat Number (USN)</Label>
                  <Input
                    id="manual-usn"
                    placeholder="e.g. 1BM24CS001"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    className="mt-1.5 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-pfp">Profile Picture URL (Optional)</Label>
                  <Input
                    id="manual-pfp"
                    placeholder="https://..."
                    value={pfpUrl}
                    onChange={(e) => setPfpUrl(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleCompleteOnboarding} className="pt-4 border-t-2 border-ink/10 flex justify-end">
              <Button
                type="submit"
                disabled={!usn.trim() || saving}
                className="bg-punch text-white hover:bg-punch/90 border-2 border-ink shadow-[3px_3px_0_var(--color-ink)]"
              >
                {saving ? "Saving Profile..." : "Complete Setup & Continue"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
