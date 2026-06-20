'use client'

import { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import Particles from './ParticlesInner'

export default function ParticlesBackground() {
  return (
    <ParticlesProvider init={loadSlim}>
      <Particles />
    </ParticlesProvider>
  )
}
