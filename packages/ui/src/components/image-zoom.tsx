'use client'

import { XIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { MouseEvent, PropsWithChildren, useRef, useState } from 'react'
import { TransformComponent, TransformWrapper, useControls, useTransformEffect } from 'react-zoom-pan-pinch'

import { Button } from './ui/button'

interface Props {
  src: string
}

export function ImageZoom({ src, children }: PropsWithChildren<Props>) {
  const [state, setState] = useState<'initial' | 'zoom'>('initial')

  return (
    <>
      <div tabIndex={0} role="button" onClick={() => setState('zoom')}>{children}</div>

      {state === 'zoom' && (
        <TransformWrapper>
          <InnerImageZoom
            src={src}
            onClose={() => setState('initial')}
          />
        </TransformWrapper>
      )}
    </>
  )
}

interface InnerProps {
  src: string
  onClose(): void
}

function InnerImageZoom({ src, onClose }: InnerProps) {
  const wrapper = useRef<HTMLDivElement | null>(null)
  const { zoomIn, zoomOut } = useControls()

  const [currentScale, setCurrentScale] = useState(1)

  useTransformEffect(({ state }) => {
    setCurrentScale(state.scale)
  })

  function handleClickOutside(e: MouseEvent<HTMLDivElement>) {
    if (e.target === wrapper.current) return

    onClose()
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/80" aria-modal="true">
      <div className="absolute flex top-0 left-0 z-10 w-full justify-end gap-2 py-4 px-8 bg-black/60">
        <Button variant="ghost" size="icon" onClick={() => zoomIn()}>
          <ZoomInIcon color="white" className="size-6" />
        </Button>
        <Button
          variant="ghost" size="icon"
          disabled={currentScale <= 1}
          onClick={() => zoomOut()}
        >
          <ZoomOutIcon color="white" className="size-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon color="white" className="size-6" />
        </Button>
      </div>
      <TransformComponent>
        <div className="flex w-dvw h-dvh" onClick={handleClickOutside}>
          <div ref={wrapper} className="m-auto">
            <img src={src} alt="" />
          </div>
        </div>
      </TransformComponent>
    </div>
  )
}
