'use client'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ColourfulText } from '@/components/ui/colorful-text'
import { Separator } from '@/components/ui/separator'
import { allBrands } from '@/lib/brands'
import Grid, { type ItemConfig } from '@/lib/grid'
import { useAudioStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { ArrowRight, Pause, Play, Repeat, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'

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
      className={`absolute inset-1 flex items-center justify-center dark:brightness-50 brightness-100 ${colorClass} border rounded-lg`}
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
  const { isPlaying, isMuted, isLoopEnabled, play, toggle, toggleMute, toggleLoop } = useAudioStore()

  const handleStartQuiz = async () => {
    await play()
  }

  const handleToggleMute = () => {
    toggleMute()
  }

  const handleTogglePause = async () => {
    await toggle()
  }

  const handleToggleLoop = () => {
    toggleLoop()
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={handleToggleLoop}
          onKeyDown={(e) => e.key === 'Enter' && handleToggleLoop()}
          tabIndex={0}
          aria-label={isLoopEnabled ? 'Disable audio loop' : 'Enable audio loop'}
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors',
            isLoopEnabled
              ? 'bg-primary/20 hover:bg-primary/30 text-primary'
              : 'bg-secondary/80 hover:bg-secondary'
          )}
        >
          <Repeat className="h-4 w-4" />
        </button>
        <button
          onClick={handleTogglePause}
          onKeyDown={(e) => e.key === 'Enter' && handleTogglePause()}
          tabIndex={0}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          onClick={handleToggleMute}
          onKeyDown={(e) => e.key === 'Enter' && handleToggleMute()}
          tabIndex={0}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <ModeToggle />
      </div>
      <div className="absolute inset-0 z-0">
        <Grid gridSize={120} renderItem={GridCell} />
      </div>
      <div className="relative z-50 flex items-center justify-center min-h-screen p-4 pointer-events-none">
        <Card variant="glass" className={cn("w-auto max-w-2xl pointer-events-auto select-none py-2 gap-2")}>
          <CardContent className={cn("p-2")}>
            <div className="text-center space-y-2">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  <ColourfulText text="Am I Cracked?" />
                </h1>
                <p className="text-xxs md:text-xs lg:text-sm text-muted-foreground max-w-60 mx-auto">
                  Ever wonder if you're a 10x engineer? Let's find out together.
                </p>
                <Separator className="my-2 w-full" />
                <p className="text-xxs md:text-xs lg:text-sm text-muted-foreground mx-auto max-w-60">
                  <span className="font-bold">tip:</span> try dragging/scrolling this canvas! its infinite ;)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="text-sm px-3 py-2 h-auto"
                >
                  <Link href="/st" prefetch={true} onClick={handleStartQuiz}>
                    Start Quiz
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                {/* <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="text-sm px-3 py-2 h-auto"
                >
                  <Link href="https://github.com/dotcomnerd/amicracked" target="_blank" rel="noopener noreferrer">
                    <Code2 className="h-4 w-4" />
                    View Source
                  </Link>
                </Button> */}
              </div>

              <div className="pt-2">
                <div className="text-center">
                  <span>Made by @<a className="text-primary font-bold underline hover:text-primary/80" href="https://github.com/nyumat" target="_blank" rel="noopener noreferrer"><ColourfulText text="nyumat" underlined /></a></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
