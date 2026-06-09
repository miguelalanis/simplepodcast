import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  episodeId: string;
  duration?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function parseDuration(value?: string): number {
  if (!value) return 0;
  const match = value.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

export default function AudioPlayer({ src, episodeId, duration }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(() => parseDuration(duration));
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      const audios = document.querySelectorAll<HTMLAudioElement>('audio');
      audios.forEach((other) => {
        if (other !== audio && !other.paused) other.pause();
      });
    };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setTotalTime(audio.duration);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      setIsBuffering(true);
      try {
        await audio.play();
      } catch {
        setIsBuffering(false);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const changeSpeed = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <div
      data-audio-player={episodeId}
      className="mt-3 flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-3 py-2 shadow-sm"
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-800"
      >
        {isBuffering ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : isPlaying ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      <div className="flex flex-1 items-center gap-2.5">
        <span className="font-mono text-xs tabular-nums text-zinc-500">
          {formatTime(currentTime)}
        </span>
        <div className="relative flex-1">
          <div className="h-1 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full bg-zinc-900 transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={totalTime || 0}
            value={currentTime}
            onChange={handleSeek}
            step={0.1}
            aria-label="Progreso"
            className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-zinc-900"
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-zinc-500">
          {formatTime(totalTime)}
        </span>
      </div>

      <div className="relative hidden sm:block">
        <button
          type="button"
          onClick={() => setShowSpeedMenu((v) => !v)}
          aria-label="Velocidad de reproducción"
          className="rounded-full px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          {playbackRate}×
        </button>
        {showSpeedMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSpeedMenu(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1.5 w-24 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changeSpeed(rate)}
                  className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-zinc-50 ${
                    playbackRate === rate ? 'font-semibold text-zinc-900' : 'text-zinc-600'
                  }`}
                >
                  {rate}×
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        className="hidden h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 sm:inline-flex"
      >
        {isMuted ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </div>
  );
}
