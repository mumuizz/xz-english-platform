import { useRef, useState } from 'react'
import type { ListeningMaterial } from '../../types'
import { listeningTypeConfig } from '../../constants/theme'

interface AudioPlayerProps {
  material: ListeningMaterial
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ material }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  const togglePlay = async () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (e) {
      console.error('Failed to play audio', e)
    }
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#ef233c] to-[#c41c30] p-8 text-white shadow-xl">
      <div className="text-sm uppercase tracking-[0.2em] text-white/70">
        {material.tags.includes('exam-focus') ? 'Exam Focus' : 'Easy Listening'}
      </div>
      <div className="mt-2 text-2xl font-bold">{listeningTypeConfig[material.type].label}</div>
      <div className="mt-6">
        <input
          type="range"
          min="0"
          max={material.duration}
          value={currentTime}
          onChange={(e) => {
            const time = Number.parseFloat(e.target.value)
            setCurrentTime(time)
            if (audioRef.current) audioRef.current.currentTime = time
          }}
          className="w-full accent-white"
        />
        <div className="mt-2 flex justify-between text-sm text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(material.duration)}</span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={togglePlay} className="rounded-2xl bg-white px-6 py-3 font-semibold text-[#ef233c]">
          {isPlaying ? '暂停' : '播放'}
        </button>
        {[0.75, 1, 1.25, 1.5].map((rate) => (
          <button
            key={rate}
            onClick={() => { setPlaybackRate(rate); if (audioRef.current) audioRef.current.playbackRate = rate }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${playbackRate === rate ? 'bg-white text-[#ef233c]' : 'bg-white/15 text-white'}`}
          >
            {rate}x
          </button>
        ))}
      </div>
      <audio
        ref={audioRef}
        src={material.audioUrl}
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime) }}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
