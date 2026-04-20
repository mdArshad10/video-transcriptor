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
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

  // ─── State ───────────────────────────────────────────────────────────────
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

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

  // ─── Reset when src changes ───────────────────────────────────────────────
  useEffect(() => {
    hasRestoredRef.current = false
    latestPositionRef.current = 0
    setIsReady(false)
    setHasError(false)
    setErrorMessage("")
    setIsPlaying(autoPlay)
  }, [src, normalizedInitialPosition, autoPlay])

  // ─── Seek to initial position once player is ready ────────────────────────
  const handleReady = useCallback(() => {

    if (!isReady && hasRestoredRef.current || normalizedInitialPosition <= 0) return

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
      setIsReady(true)
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
    setIsPlaying(false)
  }, [onPausePosition])

  // ─── Ended handler ────────────────────────────────────────────────────────
  const handleEnded = useCallback(() => {
    const player = playerRef.current
    const current = Math.floor(
      player?.currentTime ?? latestPositionRef.current ?? 0
    )
    latestPositionRef.current = current
    onCompleted?.(current)
    setIsPlaying(false)
  }, [onCompleted])

  // ─── Error handler ────────────────────────────────────────────────────────
  const handleError = useCallback((error: unknown) => {
    console.error("[MyPlayer] Playback error:", error)
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "An unknown playback error occurred."
    setHasError(true)
    setErrorMessage(msg)
  }, [])

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

  // ─── Full media URL ───────────────────────────────────────────────────────
  const mediaUrl = `${AWS_S3_DESTINATION_BUCKET}/${src}`

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="my-player-wrapper">
      {hasError ? (
        <div className="my-player-error" role="alert">
          <span className="my-player-error-icon" aria-hidden="true">
            ⚠
          </span>
          <p className="my-player-error-title">Playback failed</p>
          {errorMessage && (
            <p className="my-player-error-message">{errorMessage}</p>
          )}
          <button
            className="my-player-error-retry"
            onClick={() => {
              setHasError(false)
              setErrorMessage("")
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <MediaController
          className="my-player-controller"
          gesturesDisabled={false}
        >
          {/* ── ReactPlayer renders the actual <video> element.
               The `slot="media"` prop tells media-chrome to treat it
               as the controlled media source. ── */}
          <ReactPlayer
            ref={playerRef}
            slot="media"
            className="react-player"
            src={mediaUrl}
            playing={isPlaying}
            controls={false} // media-chrome owns the controls
            playsInline
            muted={autoPlay} // autoplay requires muted in most browsers
            width="100%"
            height="100%"
            style={{ display: "block" }}
            light={
              thumbnail_url
                ? <img src={thumbnail_url} alt="Thumbnail" />
                : false
            }
            onReady={handleReady}
            onPlay={() => setIsPlaying(true)}
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

          {/* ── Loading indicator (shown while buffering) ── */}
          <MediaLoadingIndicator slot="centered-chrome" noAutohide />

          {/* ── Tap-to-play / gesture layer ── */}
          <MediaGestureReceiver slot="centered-chrome" />

          {/* ── Optional title overlay ── */}
          {title && (
            <div slot="top-chrome" className="my-player-title">
              {title}
            </div>
          )}

          {/* ── Main control bar ── */}
          <MediaControlBar className="my-player-control-bar bg-black flex gap-2">
            {/* Play / Pause */}
            <MediaPlayButton />

            {/* Seek ±10 s */}
            <MediaSeekBackwardButton seekOffset={10} />
            <MediaSeekForwardButton seekOffset={10} />

            {/* Volume */}
            <MediaMuteButton />
            <MediaVolumeRange />

            {/* Scrubber + time */}
            <MediaTimeRange />
            <MediaTimeDisplay showDuration />

            {/* Captions toggle (visible when a text track is available) */}
            <MediaCaptionsButton />

            {/* Playback speed: 0.5× 1× 1.5× 2× */}
            <MediaPlaybackRateButton rates={[0.5, 1, 1.25, 1.5, 2]} />

            {/* Picture-in-Picture */}
            <MediaPipButton />

            {/* AirPlay (Safari only; hidden elsewhere automatically) */}
            <MediaAirplayButton />

            {/* Fullscreen */}
            <MediaFullscreenButton />
          </MediaControlBar>
        </MediaController>
      )}
    </div>
  )
}

export default MyPlayer
