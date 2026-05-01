import ReactPlayer from "react-player"
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaPipButton,
  MediaCaptionsButton,
  MediaLoadingIndicator,
  MediaGestureReceiver,
  MediaAirplayButton,
} from "media-chrome/react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { AWS_S3_DESTINATION_BUCKET } from "@/utils/url"

interface MyPlayerProps {
  src: string
  thumbnail_url?: string
  initialPositionSeconds?: number
  onPausePosition?: (seconds: number) => void
  onCompleted?: (seconds: number) => void
  /** Optional title shown in the control bar overlay */
  title?: string
  /** Allow autoplay (muted) on mount */
  autoPlay?: boolean
}

interface PlayState {
  mediaUrl: string
  isPlaying: boolean
}

interface PlaybackErrorState {
  mediaUrl: string
}

function buildMediaUrl(src: string) {
  if (/^https?:\/\//i.test(src)) {
    return src
  }

  const baseUrl = AWS_S3_DESTINATION_BUCKET.replace(/\/+$/, "")
  const mediaPath = src.replace(/^\/+/, "")

  return `${baseUrl}/${mediaPath}`
}

export const MyPlayer = ({
  src,
  thumbnail_url,
  initialPositionSeconds = 0,
  onPausePosition,
  onCompleted,
  title,
  autoPlay = false,
}: MyPlayerProps) => {
  // ─── Refs ────────────────────────────────────────────────────────────────
  // In the new react-player API the ref callback receives the raw HTMLVideoElement.
  const playerRef = useRef<HTMLVideoElement | null>(null)
  const hasRestoredRef = useRef(false)
  const latestPositionRef = useRef(0)

  // ─── Full media URL ───────────────────────────────────────────────────────
  const mediaUrl = useMemo(() => buildMediaUrl(src), [src])

  // ─── Source-keyed state ──────────────────────────────────────────────────
  const [playState, setPlayState] = useState<PlayState>({
    mediaUrl,
    isPlaying: autoPlay,
  })
  const [errorState, setErrorState] = useState<PlaybackErrorState | null>(null)
  const activeError = errorState?.mediaUrl === mediaUrl ? errorState : null
  const isPlaying =
    playState.mediaUrl === mediaUrl ? playState.isPlaying : autoPlay

  // ─── Normalized initial position ─────────────────────────────────────────
  const normalizedInitialPosition = useMemo(() => {
    if (
      !Number.isFinite(initialPositionSeconds) ||
      initialPositionSeconds <= 0
    ) {
      return 0
    }
    return Math.floor(initialPositionSeconds)
  }, [initialPositionSeconds])

  // ─── Reset refs when the source or resume point changes ───────────────────
  useEffect(() => {
    hasRestoredRef.current = false
    latestPositionRef.current = 0
  }, [mediaUrl, normalizedInitialPosition])

  // ─── Seek to initial position once player is ready ────────────────────────
  const handleReady = useCallback(() => {
    if (hasRestoredRef.current || normalizedInitialPosition <= 0) return

    const player = playerRef.current
    if (!player) return

    const duration = player.duration
    const maxSeekable =
      Number.isFinite(duration) && duration > 1
        ? Math.floor(duration - 1)
        : normalizedInitialPosition
    const seekTo = Math.min(normalizedInitialPosition, maxSeekable)

    if (seekTo > 0) {
      player.currentTime = seekTo
      latestPositionRef.current = seekTo
      hasRestoredRef.current = true
    }
  }, [normalizedInitialPosition])

  // ─── Track current playback position (fires ~250 ms) ─────────────────────
  const handleTimeUpdate = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    latestPositionRef.current = Math.floor(player.currentTime)
  }, [])

  // ─── Track buffered / loaded progress ────────────────────────────────────
  const handleProgress = useCallback(() => {
    // onProgress fires when buffered ranges change; no argument in new API.
    // Position tracking is handled by onTimeUpdate above.
  }, [])

  // ─── Pause handler ────────────────────────────────────────────────────────
  const handlePause = useCallback(() => {
    const player = playerRef.current
    const current = Math.floor(
      player?.currentTime ?? latestPositionRef.current ?? 0
    )
    latestPositionRef.current = current
    onPausePosition?.(current)
    setPlayState({ mediaUrl, isPlaying: false })
  }, [mediaUrl, onPausePosition])

  // ─── Ended handler ────────────────────────────────────────────────────────
  const handleEnded = useCallback(() => {
    const player = playerRef.current
    const current = Math.floor(
      player?.currentTime ?? latestPositionRef.current ?? 0
    )
    latestPositionRef.current = current
    onCompleted?.(current)
    setPlayState({ mediaUrl, isPlaying: false })
  }, [mediaUrl, onCompleted])

  // ─── Error handler ────────────────────────────────────────────────────────
  const handleError = useCallback(() => {
    setPlayState({ mediaUrl, isPlaying: false })
    setErrorState({ mediaUrl })
  }, [mediaUrl])

  const handlePlay = useCallback(() => {
    setErrorState((currentError) =>
      currentError?.mediaUrl === mediaUrl ? null : currentError
    )
    setPlayState({ mediaUrl, isPlaying: true })
  }, [mediaUrl])

  const handleRetry = useCallback(() => {
    hasRestoredRef.current = false
    setErrorState((currentError) =>
      currentError?.mediaUrl === mediaUrl ? null : currentError
    )
    setPlayState({ mediaUrl, isPlaying: autoPlay })
  }, [autoPlay, mediaUrl])

  // ─── Tab visibility: persist position on hide ─────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePause()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      // Persist on unmount too
      handlePause()
    }
  }, [handlePause])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full min-h-0 w-full bg-[oklch(0.145_0_0)] text-[oklch(0.985_0_0)]">
      {activeError ? (
        <div
          className="flex h-full min-h-64 w-full items-center justify-center px-6"
          role="alert"
        >
          <div className="max-w-sm text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-[oklch(0.985_0_0_/_18%)] bg-[oklch(0.985_0_0_/_8%)] text-[oklch(0.985_0_0)]">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-semibold">Playback failed</p>
            <p className="mt-2 text-sm leading-6 text-[oklch(0.985_0_0_/_72%)]">
              The video could not be played. Try again in a moment.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-5"
              onClick={handleRetry}
            >
              <RefreshCcw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <MediaController
          className="block h-full w-full overflow-hidden bg-[oklch(0.145_0_0)] [--media-control-background:oklch(0.145_0_0_/_82%)] [--media-control-hover-background:oklch(0.985_0_0_/_12%)] [--media-control-padding:0.5rem] [--media-primary-color:oklch(0.985_0_0)] [--media-secondary-color:oklch(0.985_0_0_/_70%)]"
          gesturesDisabled={false}
        >
          <ReactPlayer
            ref={playerRef}
            slot="media"
            className="h-full w-full"
            src={mediaUrl}
            playing={isPlaying}
            controls={false}
            playsInline
            muted={autoPlay}
            width="100%"
            height="100%"
            style={{
              display: "block",
              backgroundColor: "oklch(0.145 0 0)",
            }}
            light={
              thumbnail_url
                ? (
                    <img
                      src={thumbnail_url}
                      alt={title ? `${title} thumbnail` : "Video thumbnail"}
                      className="h-full w-full object-cover"
                    />
                  )
                : false
            }
            onReady={handleReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
            onProgress={handleProgress}
            onError={handleError}
            config={{
              hls: {
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                enableWorker: true,
              },
            }}
          />

          <MediaLoadingIndicator
            slot="centered-chrome"
            className="rounded-lg bg-[oklch(0.145_0_0_/_78%)] p-3 text-[oklch(0.985_0_0)]"
            noAutohide
          />

          <MediaGestureReceiver slot="centered-chrome" />

          {title && (
            <div
              slot="top-chrome"
              className="max-w-full bg-linear-to-b from-[oklch(0.145_0_0_/_72%)] to-transparent px-4 py-3 text-sm font-medium text-[oklch(0.985_0_0)]"
            >
              {title}
            </div>
          )}

          <MediaControlBar className="flex w-full min-w-0 flex-wrap items-center gap-1 border-t border-[oklch(0.985_0_0_/_12%)] bg-[oklch(0.145_0_0_/_88%)] p-2 text-[oklch(0.985_0_0)] backdrop-blur-sm [&>*]:min-h-10 [&>*]:rounded-md [&>*]:focus-visible:outline-none [&>*]:focus-visible:ring-3 [&>*]:focus-visible:ring-[oklch(0.708_0_0_/_55%)]">
            <MediaPlayButton />
            <MediaSeekBackwardButton seekOffset={10} />
            <MediaSeekForwardButton seekOffset={10} />
            <MediaMuteButton />
            <MediaVolumeRange className="hidden w-20 sm:block" />
            <MediaTimeRange className="min-w-32 flex-1 basis-40" />
            <MediaTimeDisplay showDuration />
            <MediaCaptionsButton />
            <MediaPlaybackRateButton rates={[0.5, 1, 1.25, 1.5, 2]} />
            <MediaPipButton />
            <MediaAirplayButton />
            <MediaFullscreenButton />
          </MediaControlBar>
        </MediaController>
      )}
    </div>
  )
}

export default MyPlayer
