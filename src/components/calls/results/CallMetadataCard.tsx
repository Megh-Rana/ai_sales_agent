import React, { useState } from 'react';
import { 
  PhoneCall, 
  Play, 
  Pause, 
  Volume2, 
  Wifi, 
  Layers,
  Hash, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';
import { CallMetadata } from '../../../types/callResults';

interface CallMetadataCardProps {
  metadata: CallMetadata;
}

export const CallMetadataCard: React.FC<CallMetadataCardProps> = ({
  metadata,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'1.0x' | '1.25x' | '1.5x'>('1.0x');
  const [playbackProgress, setPlaybackProgress] = useState(38); // 38% mockup progress

  const toggleSpeed = () => {
    if (speed === '1.0x') setSpeed('1.25x');
    else if (speed === '1.25x') setSpeed('1.5x');
    else setSpeed('1.0x');
  };

  return (
    <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-slate-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Telephony & Audio Verification
          </h3>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          {metadata.recordingStatus}
        </span>
      </div>

      {/* Mock Audio Player Bar */}
      <div className="bg-[#151A25] border border-[#232B3B] rounded-lg p-3.5 mb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover active:bg-blue-700 text-white flex items-center justify-center shadow transition-transform active:scale-95"
              title={isPlaying ? 'Pause recording' : 'Play recording'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => setPlaybackProgress(0)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Restart recording"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="text-xs font-mono text-slate-300">
              <span>01:24</span>
              <span className="text-slate-600"> / </span>
              <span className="text-slate-500">{metadata.duration}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeed}
              className="text-[11px] font-mono font-medium text-slate-300 bg-[#1E2536] hover:bg-[#283247] px-2 py-0.5 rounded border border-[#2D3748] transition-colors"
            >
              {speed}
            </button>

            <Volume2 className="w-4 h-4 text-slate-400 hidden sm:inline" />
          </div>
        </div>

        {/* Audio Waveform Scrubber */}
        <div className="relative w-full h-8 flex items-center gap-[3px] px-1 bg-[#0D1017] rounded border border-[#1E2536]">
          {Array.from({ length: 48 }).map((_, idx) => {
            const height = ((Math.sin(idx * 0.4) + 1.2) * 12 + (idx % 3) * 4);
            const isPlayed = (idx / 48) * 100 <= playbackProgress;

            return (
              <div
                key={idx}
                onClick={() => setPlaybackProgress((idx / 48) * 100)}
                className={`flex-1 rounded-full cursor-pointer transition-all ${
                  isPlayed ? 'bg-primary' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                style={{ height: `${Math.min(height, 26)}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Telephony Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-[#151A25] p-2.5 rounded border border-[#232B3B]">
          <div className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1 mb-0.5">
            <Layers className="w-3 h-3 text-slate-400" />
            Direction
          </div>
          <div className="font-semibold text-white">{metadata.direction}</div>
        </div>

        <div className="bg-[#151A25] p-2.5 rounded border border-[#232B3B]">
          <div className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1 mb-0.5">
            <Hash className="w-3 h-3 text-slate-400" />
            Attempt
          </div>
          <div className="font-semibold text-white">#{metadata.attemptNumber}</div>
        </div>

        <div className="bg-[#151A25] p-2.5 rounded border border-[#232B3B]">
          <div className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1 mb-0.5">
            <Wifi className="w-3 h-3 text-slate-400" />
            Codec
          </div>
          <div className="font-semibold text-white truncate">{metadata.telephonyCodec || 'Opus 48kHz'}</div>
        </div>

        <div className="bg-[#151A25] p-2.5 rounded border border-[#232B3B]">
          <div className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1 mb-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Latency
          </div>
          <div className="font-semibold text-emerald-400">{metadata.carrierLatency || '180ms'}</div>
        </div>
      </div>
    </div>
  );
};
