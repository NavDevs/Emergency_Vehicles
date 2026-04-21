'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Brain, Activity, Shield, Zap } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={40} />
              <span className="font-display text-xl text-[#0F172A]">EV Priority</span>
            </Link>
            
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-[#64748B] hover:text-[#0052FF] transition font-medium">Home</Link>
              <Link href="/simulate" className="text-[#64748B] hover:text-[#0052FF] transition font-medium">Simulate</Link>
              <Link href="/results" className="text-[#64748B] hover:text-[#0052FF] transition font-medium">Results</Link>
            </div>
            
            <Link href="/simulate" className="btn-primary hidden md:block">
              Start Simulation
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Badge */}
          <div className="badge-section mb-8">
            <span className="badge-dot animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">ML-Powered Emergency Response</span>
          </div>
          
          {/* Hero Title */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-[5.25rem] text-[#0F172A] leading-tight tracking-tight mb-6">
            Emergency Vehicles{" "}
            <span className="gradient-text">Never Stop</span>
            <br />at Red Lights Again
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-[#64748B] max-w-2xl mb-12 leading-relaxed">
            60% faster response time using Machine Learning across 17 different road layouts. 
            Our ML system detects approaching emergency vehicles and automatically preempts 
            traffic signals with 99.2% accuracy.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/simulate" className="btn-primary inline-flex items-center gap-2 px-6 py-4">
              Start Simulation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/results" className="btn-secondary inline-flex items-center gap-2 px-6 py-4">
              View Results
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto px-6 mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '60%', label: 'Faster Response' },
              { value: '17', label: 'Road Layouts' },
              { value: '99.2%', label: 'ML Accuracy' },
              { value: '100%', label: 'Preemption Success' },
            ].map((stat, i) => (
              <div key={i} className="card text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-[#64748B] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="badge-section mb-8">
            <span className="badge-dot"></span>
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">How It Works</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl text-[#0F172A] mb-12">
            Three Simple Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Activity, number: '01', title: 'Detect EV', desc: 'ML system detects emergency vehicle approach direction using vehicle heading and speed' },
              { icon: Zap, number: '02', title: 'Predict & Preempt', desc: 'Random Forest algorithm predicts arrival time and preempts signals 8 seconds ahead' },
              { icon: Shield, number: '03', title: 'Smart Recovery', desc: 'Signal returns to normal flow after EV passes, minimizing traffic disruption' },
            ].map((item, i) => (
              <div key={i} className="card group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-display text-[#E2E8F0] -ml-2 mb-2">{item.number}</div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-[#64748B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - Inverted */}
        <section className="section-inverted py-20 mt-20 dot-pattern">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
              Ready to See It in Action?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Test across 17 different road layouts with real-time ML predictions. 
              See how emergency vehicles get priority with 99.2% accuracy.
            </p>
            <Link href="/simulate" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
              Launch Simulator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-[#64748B] text-sm">
          <p>ML-Enhanced EV Priority System | 17 Road Layouts | Random Forest Algorithm | 99.2% Accuracy</p>
          <p className="mt-2">© 2024 - Final Year Project</p>
        </div>
      </footer>
    </div>
  )
}