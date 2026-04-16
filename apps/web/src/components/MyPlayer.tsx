import "@videojs/react/video/skin.css"
import { createPlayer, videoFeatures } from "@videojs/react"
import { VideoSkin } from "@videojs/react/video"
import { HlsVideo } from "@videojs/react/media/hls-video"
import { useCallback, useEffect, useMemo, useRef } from "react"

const Player = createPlayer({ features: videoFeatures })

interface MyPlayerProps {
  src: string
  thumbnail_url?: string
  initialPositionSeconds?: number
  onPausePosition?: (seconds: number) => void
  onCompleted?: (seconds: number) => void
}

export const MyPlayer = ({
  src,
  thumbnail_url,
  initialPositionSeconds = 0,
  onPausePosition,
  onCompleted,
}: MyPlayerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hasRestoredRef = useRef(false)
  const latestPositionRef = useRef(0)

  const getVideoElement = useCallback(() => {
    return containerRef.current?.querySelector("video") ?? null
  }, [])

  const normalizedInitialPosition = useMemo(() => {
    if (!Number.isFinite(initialPositionSeconds) || initialPositionSeconds <= 0) {
      return 0
    }
    return Math.floor(initialPositionSeconds)
  }, [initialPositionSeconds])

  const handleTimeUpdate = useCallback(() => {
    const videoEl = getVideoElement()
    if (!videoEl) return
    latestPositionRef.current = Math.floor(videoEl.currentTime ?? 0)
  }, [getVideoElement])

  const handlePause = useCallback(() => {
    const videoEl = getVideoElement()
    const current = Math.floor(videoEl?.currentTime ?? latestPositionRef.current ?? 0)
    latestPositionRef.current = current
    onPausePosition?.(current)
  }, [getVideoElement, onPausePosition])

  const handleEnded = useCallback(() => {
    const videoEl = getVideoElement()
    const current = Math.floor(videoEl?.currentTime ?? latestPositionRef.current ?? 0)
    latestPositionRef.current = current
    onCompleted?.(current)
  }, [getVideoElement, onCompleted])

  const handleLoadedMetadata = useCallback(() => {
    if (hasRestoredRef.current || normalizedInitialPosition <= 0) return
    const videoEl = getVideoElement()
    if (!videoEl) return

    const maxSeekable =
      Number.isFinite(videoEl.duration) && videoEl.duration > 1
        ? Math.floor(videoEl.duration - 1)
        : normalizedInitialPosition
    const seekTo = Math.min(normalizedInitialPosition, maxSeekable)

    if (seekTo > 0) {
      videoEl.currentTime = seekTo
      latestPositionRef.current = seekTo
      hasRestoredRef.current = true
    }
  }, [getVideoElement, normalizedInitialPosition])

  useEffect(() => {
    hasRestoredRef.current = false
    latestPositionRef.current = 0
  }, [src, normalizedInitialPosition])

  useEffect(() => {
    const persistOnTabHidden = () => {
      if (!document.hidden) return
      handlePause()
    }
    document.addEventListener("visibilitychange", persistOnTabHidden)
    return () => {
      document.removeEventListener("visibilitychange", persistOnTabHidden)
      handlePause()
    }
  }, [handlePause])

  return (
    <div ref={containerRef}>
      <Player.Provider>
        <VideoSkin poster={thumbnail_url} style={{
          borderRadius: 0,
          margin: "1rem",
        }} >
          <HlsVideo
            src={src}
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            onEnded={handleEnded}
          />
        </VideoSkin>
      </Player.Provider>
    </div>
  )
}
