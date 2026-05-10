"use client";

import React from "react";
import { Orbitron, Inter } from "next/font/google";
import { 
  Cpu, 
  Smartphone, 
  Tablet, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Menu, 
  X,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const orbitron = Orbitron({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className={cn("min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30", inter.className)}>
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className={cn("text-2xl font-black tracking-tighter flex items-center gap-2", orbitron.className)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,102,255,0.5)]">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">COSTECH</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Services</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Enterprise</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Search className="w-5 h-5" />
            </Button>
            <Button className={cn("hidden sm:flex rounded-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all hover:scale-105", orbitron.className)}>
              BOOK REPAIR
            </Button>
            <button 
              className="md:hidden text-slate-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida/ADBb0ugXRpdVk7D4zTnjWVD30NMH_wK1VXBMlhdnKSS5BoNI-ja3R3Cd5vU10g2dKsDYVhHEUpZFeUXOQyQVoXgVzSQV63I1VI_cJ-qwFne6uv5zuKJxmvZmZtaEZ1idx3L6t46KiM6D_ZshKt7qrRYzoDwi_wqDgwgKX0Dic67Yp7WM4XPhu5Izl8e8-i48z6COgDrqBUnc2SObpoq3YWC5NheGkFpt0JWKEEAR57qqaKQSU_jZHipQqBUhB4Q" 
            alt="Futuristic Motherboard"
            className="w-full h-full object-cover opacity-20 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Next-Gen Tech Restoration
          </div>
          
          <h1 className={cn("text-5xl md:text-8xl font-black mb-6 tracking-tight leading-[1.1]", orbitron.className)}>
            Precision Repair for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 animate-gradient">
              Digital Age
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Africa's Premier Tech Restoration Hub. We don't just fix devices; we revive the heartbeat of your digital life with surgical precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className={cn("h-14 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-lg shadow-[0_0_30px_rgba(0,102,255,0.4)] transition-all hover:scale-105", orbitron.className)}>
              BOOK A REPAIR
            </Button>
            <Button size="lg" variant="outline" className={cn("h-14 px-10 rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-lg transition-all", orbitron.className)}>
              TRACK ORDER
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-white/5 pt-12">
            {[
              { label: "Devices Revived", val: "15k+" },
              { label: "Success Rate", val: "99.2%" },
              { label: "Expert Techs", val: "40+" },
              { label: "Average Time", val: "24h" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className={cn("text-3xl font-bold text-white", orbitron.className)}>{stat.val}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className={cn("text-4xl md:text-5xl font-bold mb-4", orbitron.className)}>Elite Services</h2>
              <p className="text-slate-400 text-lg">Specialized restoration for the hardware that powers your world.</p>
            </div>
            <a href="#" className="flex items-center gap-2 text-cyan-400 font-bold hover:gap-4 transition-all">
              VIEW ALL SERVICES <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: "Computer Repair", 
                desc: "Full hardware diagnostics, logic board micro-soldering, and performance optimization.",
                icon: Cpu,
                color: "blue"
              },
              { 
                title: "Phone Restoration", 
                desc: "Display replacement, internal circuitry repair, and water damage recovery.",
                icon: Smartphone,
                color: "cyan"
              },
              { 
                title: "Tablet Solutions", 
                desc: "Battery calibration, touchscreen repair, and enterprise fleet management.",
                icon: Tablet,
                color: "purple"
              },
            ].map((service, i) => (
              <div key={i} className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl group-hover:bg-blue-600/10 transition-all" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 group-hover:border-cyan-500/50 transition-colors">
                    <service.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className={cn("text-2xl font-bold mb-3", orbitron.className)}>{service.title}</h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <button className="flex items-center gap-2 text-sm font-bold text-white/50 group-hover:text-white transition-colors">
                    LEARN MORE <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white/5 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: ShieldCheck, title: "Warranty Guaranteed", desc: "90-day comprehensive warranty on all repairs." },
              { icon: Zap, title: "Rapid Turnaround", desc: "Most repairs completed within 24 hours." },
              { icon: Clock, title: "Real-time Tracking", desc: "Monitor your repair status via our digital portal." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <item.icon className="w-10 h-10 text-cyan-400 mb-4" />
                <h4 className={cn("text-xl font-bold mb-2", orbitron.className)}>{item.title}</h4>
                <p className="text-slate-400 text-sm max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className={cn("text-xl font-black", orbitron.className)}>
            COSTECH
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Costech Restoration. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
