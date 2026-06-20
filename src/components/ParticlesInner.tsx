'use client'

import Particles from '@tsparticles/react'

const options = {
  fullScreen: false,
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'grab' as const,
      },
      resize: { enable: true },
    },
    modes: {
      grab: {
        distance: 180,
        links: { opacity: 0.4 },
      },
    },
  },
  particles: {
    color: { value: '#2d6a4f' },
    links: {
      color: '#2d6a4f',
      distance: 160,
      enable: true,
      opacity: 0.3,
      width: 1.5,
    },
    move: {
      direction: 'none' as const,
      enable: true,
      outModes: { default: 'bounce' as const },
      random: true,
      speed: 2,
      straight: false,
    },
    number: {
      density: { enable: true },
      value: 120,
    },
    opacity: {
      value: { min: 0.2, max: 0.4 },
      animation: {
        enable: true,
        speed: 1.5,
        minimumValue: 0.15,
      },
    },
    shape: { type: 'circle' },
    size: {
      value: { min: 3, max: 7 },
      animation: {
        enable: true,
        speed: 3,
        minimumValue: 2,
      },
    },
  },
  detectRetina: true,
}

export default function ParticlesInner() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <Particles id="pine-particles" className="h-full w-full" options={options} />
    </div>
  )
}
