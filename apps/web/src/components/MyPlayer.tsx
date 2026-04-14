import "@videojs/react/video/skin.css"
import { createPlayer, videoFeatures } from "@videojs/react"
import { VideoSkin } from "@videojs/react/video"
import { HlsVideo } from "@videojs/react/media/hls-video"

const Player = createPlayer({ features: videoFeatures })

interface MyPlayerProps {
  src: string
  thumbnail_url?:string
}

export const MyPlayer = ({ src,thumbnail_url }: MyPlayerProps) => {
  return (
    <Player.Provider>
      <VideoSkin poster={thumbnail_url} style={{
        borderRadius:0,
        margin:"1rem",
      }} >
        <HlsVideo src={src} playsInline  />
      </VideoSkin>
    </Player.Provider>
  )
}
