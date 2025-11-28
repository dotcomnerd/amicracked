'use client'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Grid, { type ItemConfig } from '@/lib/grid'
import { ArrowRight, Code2 } from 'lucide-react'
import Link from 'next/link'
import * as icons from 'simple-icons'

const allBrands = Object.values(icons).map((icon) => ({
  name: icon.title,
  slug: icon.slug,
  url: `https://cdn.simpleicons.org/${icon.slug}`,
}))

const GridCell = ({ gridIndex }: ItemConfig) => {
  const brand = allBrands[gridIndex % allBrands.length]
  const colors = [
    'bg-card/20 border-border/30',
    'bg-muted/20 border-border/30',
    'bg-accent/20 border-border/30',
    'bg-secondary/20 border-border/30',
    'bg-card/30 border-border/40',
    'bg-muted/30 border-border/40',
    'bg-accent/30 border-border/40',
    'bg-secondary/30 border-border/40',
  ]

  const colorClass = colors[gridIndex % colors.length]

  return (
    <div
      className={`absolute inset-1 flex items-center justify-center ${colorClass} border rounded-lg`}
    >
      <img
        src={brand.url}
        alt={brand.name}
        className="w-12 h-12 object-contain"
        draggable={false}
      />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <ModeToggle />

      <div className="absolute inset-0 z-0">
        <Grid gridSize={120} renderItem={GridCell} />
      </div>

      <div className="relative z-50 flex items-center justify-center min-h-screen p-4 pointer-events-none">
        <Card className="w-full max-w-2xl backdrop-blur-xl bg-background/60 border-border/50 shadow-2xl pointer-events-auto">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Am I Cracked?
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
                  Find out how cracked you are as a developer
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-6 h-auto group"
                >
                  <Link href="/index">
                    Start Quiz
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                >
                  <Link href="https://github.com/dotcomnerd/amicracked" target="_blank" rel="noopener noreferrer">
                    <Code2 className="mr-2 h-5 w-5" />
                    View Source
                  </Link>
                </Button>
              </div>

              <div className="pt-8 space-y-4">
                <div className="text-center">
                  <span>Made by @<a className="text-primary underline hover:text-primary/80" href="https://github.com/nyumat" target="_blank" rel="noopener noreferrer">nyumat</a></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
