'use client'

import { useEffect, useRef, useState } from 'react'
import { Shield, ArrowRight, Radar, Network, BarChart2, Play, ChevronDown } from 'lucide-react'
<<<<<<< HEAD
import { cn } from '@/lib/utils'
=======
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442

interface LandingPageProps {
  onEnter: () => void
}

const features = [
  {
    icon: Shield,
    title: 'Real-Time Threat Detection',
    description:
      'AI simultaneously monitors network, application, and endpoint layers — correlating signals across all attack surfaces to surface threats in milliseconds.',
    color: '#06B6D4',
    glow: 'rgba(6,182,212,0.4)',
    gradient: 'from-cyan-500/20 to-cyan-500/0',
    stat: '< 50ms',
    statLabel: 'detection latency',
  },
  {
    icon: Network,
    title: 'Incident Timeline',
    description:
      'Full kill-chain visualization from initial access to impact — every hop, every lateral movement, every compromised asset laid out with temporal precision.',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.4)',
    gradient: 'from-violet-500/20 to-violet-500/0',
    stat: '360°',
    statLabel: 'attack visibility',
  },
  {
    icon: Play,
    title: 'Attack Simulation Engine',
    description:
      'Run MITRE ATT&CK framework scenarios in a live sandboxed environment. Stress-test your defenses before adversaries find the gaps.',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.4)',
    gradient: 'from-emerald-500/20 to-emerald-500/0',
    stat: '200+',
    statLabel: 'ATT&CK techniques',
  },
  {
    icon: BarChart2,
    title: 'Analytics & Confidence Scoring',
    description:
      'ML-powered false positive suppression with per-alert confidence scores. Stop alert fatigue — focus only on what actually matters.',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.4)',
    gradient: 'from-amber-500/20 to-amber-500/0',
    stat: '91.4%',
    statLabel: 'avg. confidence score',
  },
]

function FeatureCard({
  feature,
  index,
  onEnter,
<<<<<<< HEAD
  isMounted,
=======
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
}: {
  feature: (typeof features)[0]
  index: number
  onEnter: () => void
<<<<<<< HEAD
  isMounted: boolean
=======
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const rafRef = useRef<number | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    if (rafRef.current !== null) return

    const rect = cardRef.current.getBoundingClientRect()
    const clientX = e.clientX
    const clientY = e.clientY

    rafRef.current = requestAnimationFrame(() => {
      const x = (clientX - rect.left) / rect.width - 0.5
      const y = (clientY - rect.top) / rect.height - 0.5
      setTilt({ x: y * 14, y: x * -14 })
      rafRef.current = null
    })
  }

  const handleMouseLeave = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const Icon = feature.icon

  return (
    <div
      ref={cardRef}
<<<<<<< HEAD
      className={cn(
        "perspective-card cursor-pointer opacity-0",
        isMounted && "animate-fade-in"
      )}
=======
      className="perspective-card cursor-pointer"
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      style={{ animationDelay: `${index * 0.15}s` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={onEnter}
    >
      <div
        className="tilt-card relative rounded-2xl p-6 h-full"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'translateZ(20px)' : 'translateZ(0)'}`,
          background: isHovered
            ? `rgba(10,22,44,0.9)`
            : `rgba(8,16,32,0.7)`,
          border: isHovered
            ? `1px solid ${feature.color}60`
            : `1px solid rgba(6,182,212,0.12)`,
          boxShadow: isHovered
            ? `0 30px 60px rgba(0,0,0,0.5), 0 0 30px ${feature.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Top gradient accent */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{
            background: isHovered
              ? `linear-gradient(90deg, transparent, ${feature.color}, transparent)`
              : 'transparent',
            transition: 'all 0.3s ease',
          }}
        />

        {/* Corner glow */}
        {isHovered && (
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-tr-2xl opacity-10 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top right, ${feature.color}, transparent 70%)`,
            }}
          />
        )}

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{
            background: `${feature.color}15`,
            border: `1px solid ${feature.color}30`,
            boxShadow: isHovered ? `0 0 20px ${feature.glow}` : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          <Icon
            className="w-6 h-6"
            style={{
              color: feature.color,
              filter: isHovered ? `drop-shadow(0 0 6px ${feature.color})` : 'none',
              transition: 'all 0.3s ease',
            }}
          />
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold mb-3 transition-all duration-300"
          style={{ color: isHovered ? feature.color : '#E2E8F0' }}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-400 mb-6">{feature.description}</p>

        {/* Stat */}
        <div className="flex items-end justify-between">
          <div>
            <div
              className="text-2xl font-black font-mono"
              style={{
                color: feature.color,
                textShadow: isHovered ? `0 0 15px ${feature.color}` : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {feature.stat}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{feature.statLabel}</div>
          </div>
          <div
            className="flex items-center gap-1 text-xs font-medium transition-all duration-300"
            style={{ color: isHovered ? feature.color : '#475569' }}
          >
            Explore <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Animated background particles
function Particles() {
<<<<<<< HEAD
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
=======
  const [mounted, setMounted] = useState(false)
  const [particleData, setParticleData] = useState<{
    width: string;
    height: string;
    left: string;
    top: string;
    color: string;
    animation: string;
  }[]>([])

  useEffect(() => {
    const data = Array.from({ length: 20 }).map((_, i) => ({
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      left: `${Math.random() * 100}%`,
      top: `${100 + Math.random() * 20}%`,
      color: i % 3 === 0 ? '#06B6D4' : i % 3 === 1 ? '#8B5CF6' : '#10B981',
      animation: `particle-drift ${8 + Math.random() * 12}s linear ${Math.random() * 10}s infinite`
    }))
    setParticleData(data)
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particleData.map((p, i) => (
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        <div
          key={i}
          className="absolute rounded-full"
          style={{
<<<<<<< HEAD
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${100 + Math.random() * 20}%`,
            background: i % 3 === 0 ? '#06B6D4' : i % 3 === 1 ? '#8B5CF6' : '#10B981',
            opacity: 0,
            animation: `particle-drift ${8 + Math.random() * 12}s linear ${Math.random() * 10}s infinite`,
=======
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
            background: p.color,
            opacity: 0,
            animation: p.animation,
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
          }}
        />
      ))}
    </div>
  )
}

// Animated 3D shield logo
function Shield3D() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-8" style={{ perspective: '400px' }}>
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-2 opacity-30"
        style={{
          borderColor: '#06B6D4',
          animation: 'border-rotate 6s linear infinite',
        }}
      />
      {/* Inner glow circle */}
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
          animation: 'glow-pulse 2s ease-in-out infinite',
        }}
      />
      {/* Shield icon */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: 'float 5s ease-in-out infinite' }}
      >
        <Shield
          className="w-12 h-12"
          style={{
            color: '#06B6D4',
            animation: 'shield-pulse 2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="relative min-h-screen flex flex-col items-center overflow-hidden"
      style={{ background: '#050B18' }}
    >
      {/* Cyber grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'grid-move 4s linear infinite',
        }}
      />

      {/* Radial spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)',
        }}
      />

      {/* Floating particles */}
      <Particles />

      {/* ─── HERO ─── */}
      <div
<<<<<<< HEAD
        className={cn(
          "relative z-10 flex flex-col items-center text-center pt-20 pb-16 px-6 opacity-0",
          mounted && "animate-fade-in"
        )}
=======
        className="relative z-10 flex flex-col items-center text-center pt-20 pb-16 px-6"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      >
        {/* Badge */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.3)',
            color: '#06B6D4',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            style={{ animation: 'glow-pulse 1.5s ease-in-out infinite' }}
          />
          AI-Powered Security Operations Platform
        </div>

        {/* 3D Shield */}
        <Shield3D />

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight leading-none">
          <span className="gradient-text">ThreatLens</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
          See threats before they strike. The AI-driven SOC platform that thinks faster than attackers.
        </p>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
            color: '#fff',
            boxShadow: '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(139,92,246,0.2)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 50px rgba(6,182,212,0.7), 0 0 100px rgba(139,92,246,0.4)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(139,92,246,0.2)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
          <Radar className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Enter Dashboard</span>
          <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        {/* Scroll hint */}
        <div
          className="flex flex-col items-center gap-1 mt-10 text-slate-600 text-xs"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <span>Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* ─── FEATURE CARDS ─── */}
      <div
<<<<<<< HEAD
        className={cn(
          "relative z-10 w-full max-w-6xl px-6 pb-24 opacity-0",
          mounted && "animate-fade-in"
        )}
        style={{ animationDelay: '0.3s' }}
=======
        className="relative z-10 w-full max-w-6xl px-6 pb-24"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s ease 0.3s',
        }}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      >
        {/* Section label */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1" style={{ background: 'rgba(6,182,212,0.2)' }} />
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Platform Capabilities
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(6,182,212,0.2)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
<<<<<<< HEAD
            <FeatureCard key={feature.title} feature={feature} index={i} onEnter={onEnter} isMounted={mounted} />
=======
            <FeatureCard key={feature.title} feature={feature} index={i} onEnter={onEnter} />
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm mb-4">
            Click any card or use the button above to launch the full dashboard
          </p>
          <div className="flex items-center justify-center gap-6">
            {['1,247 alerts processed', '3 active incidents', '91.4% avg confidence'].map(stat => (
              <div key={stat} className="text-xs text-slate-600">
                <span className="text-cyan-500 font-mono font-bold">●</span> {stat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
