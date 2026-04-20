/**
 * useRecording — manages microphone recording for both search and opinion
 * voice input, including real audio visualization and mock fallback.
 * v1.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const MAX_RECORDING_DURATION = 15;

export function useRecording() {
  // ── Search recording state ──
  const [isRecordingSearch, setIsRecordingSearch] = useState(false);
  const [searchRecordingLevels, setSearchRecordingLevels] = useState<number[]>(new Array(40).fill(0));
  const [searchRecordedBlob, setSearchRecordedBlob] = useState<Blob | null>(null);
  const [searchRecordingTimer, setSearchRecordingTimer] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isMockRecording, setIsMockRecording] = useState(false);

  // ── Opinion recording state ──
  const [isRecordingOpinion, setIsRecordingOpinion] = useState(false);
  const [opinionRecordingLevels, setOpinionRecordingLevels] = useState<number[]>(new Array(40).fill(0));
  const [opinionRecordingTimer, setOpinionRecordingTimer] = useState(0);
  const [isMockRecordingOpinion, setIsMockRecordingOpinion] = useState(false);

  // ── Mic permission ──
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // ── Search recording refs ──
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMockRecordingRef = useRef(false);
  const mockAnimFrameRef = useRef<number | null>(null);

  // ── Opinion recording refs ──
  const opinionMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const opinionMediaStreamRef = useRef<MediaStream | null>(null);
  const opinionAudioContextRef = useRef<AudioContext | null>(null);
  const opinionAnalyserRef = useRef<AnalyserNode | null>(null);
  const opinionAnimFrameRef = useRef<number | null>(null);
  const opinionRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opinionMockAnimFrameRef = useRef<number | null>(null);
  const opinionModalContentRef = useRef<HTMLDivElement>(null);

  // ── Check mic permission on mount ──
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
        result.onchange = () => {
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
        };
      }).catch(() => setMicPermission('prompt'));
    } else {
      setMicPermission('prompt');
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Search recording timer ──
  // Note: autoConfirmCallback must be set by consumer for auto-confirm at MAX_RECORDING_DURATION
  const autoConfirmSearchRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (isRecordingSearch) {
      setSearchRecordingTimer(0);
      recordingTimerRef.current = setInterval(() => {
        setSearchRecordingTimer(prev => {
          const newValue = prev + 1;
          if (newValue >= MAX_RECORDING_DURATION) {
            setTimeout(() => autoConfirmSearchRef.current?.(), 0);
            return MAX_RECORDING_DURATION;
          }
          return newValue;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setSearchRecordingTimer(0);
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, [isRecordingSearch]);

  // ── Opinion recording timer ──
  const autoConfirmOpinionRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (isRecordingOpinion) {
      setOpinionRecordingTimer(0);
      opinionRecordingTimerRef.current = setInterval(() => {
        setOpinionRecordingTimer(prev => {
          const newValue = prev + 1;
          if (newValue >= MAX_RECORDING_DURATION) {
            setTimeout(() => autoConfirmOpinionRef.current?.(), 0);
            return MAX_RECORDING_DURATION;
          }
          return newValue;
        });
      }, 1000);
    } else {
      if (opinionRecordingTimerRef.current) {
        clearInterval(opinionRecordingTimerRef.current);
        opinionRecordingTimerRef.current = null;
      }
      setOpinionRecordingTimer(0);
    }
    return () => {
      if (opinionRecordingTimerRef.current) {
        clearInterval(opinionRecordingTimerRef.current);
        opinionRecordingTimerRef.current = null;
      }
    };
  }, [isRecordingOpinion]);

  // ── Audio visualization ──
  const startAudioVisualization = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);
      const bars = 40;
      const step = Math.floor(dataArray.length / bars);
      const levels: number[] = [];
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
        levels.push(sum / step / 255);
      }
      setSearchRecordingLevels(levels);
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };
    updateLevels();
  }, []);

  // ── Cleanup helpers ──
  const stopRecordingCleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    setSearchRecordingLevels(new Array(40).fill(0));
  }, []);

  const stopOpinionRecordingCleanup = useCallback(() => {
    // Stop mock
    if (opinionMockAnimFrameRef.current) {
      cancelAnimationFrame(opinionMockAnimFrameRef.current);
      opinionMockAnimFrameRef.current = null;
    }
    setOpinionRecordingLevels(new Array(40).fill(0));
    // Stop real
    if (opinionAnimFrameRef.current) {
      cancelAnimationFrame(opinionAnimFrameRef.current);
      opinionAnimFrameRef.current = null;
    }
    if (opinionMediaRecorderRef.current && opinionMediaRecorderRef.current.state !== 'inactive') {
      opinionMediaRecorderRef.current.stop();
    }
    if (opinionAudioContextRef.current) {
      opinionAudioContextRef.current.close();
      opinionAudioContextRef.current = null;
    }
    if (opinionMediaStreamRef.current) {
      opinionMediaStreamRef.current.getTracks().forEach(t => t.stop());
      opinionMediaStreamRef.current = null;
    }
    opinionAnalyserRef.current = null;
    setIsMockRecordingOpinion(false);
  }, []);

  // ── Mock waveform (search) ──
  const startMockWaveform = useCallback(() => {
    const animate = () => {
      setSearchRecordingLevels(prev =>
        prev.map(() => {
          const base = 0.15 + Math.random() * 0.55;
          const pulse = Math.sin(Date.now() / 300) * 0.2;
          return Math.min(1, Math.max(0, base + pulse));
        })
      );
      mockAnimFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const stopMockWaveform = useCallback(() => {
    if (mockAnimFrameRef.current) {
      cancelAnimationFrame(mockAnimFrameRef.current);
      mockAnimFrameRef.current = null;
    }
    setSearchRecordingLevels(new Array(40).fill(0));
  }, []);

  // ── Mock waveform (opinion) ──
  const startMockOpinionWaveform = useCallback(() => {
    const animate = () => {
      setOpinionRecordingLevels(prev =>
        prev.map(() => {
          const base = 0.15 + Math.random() * 0.55;
          const pulse = Math.sin(Date.now() / 300) * 0.2;
          return Math.min(1, Math.max(0, base + pulse));
        })
      );
      opinionMockAnimFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  // ── Search voice handlers ──
  const handleSearchVoiceInput = useCallback(async (
    onError: (msg: string) => void
  ) => {
    if (isRecordingSearch) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      mediaStreamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setSearchRecordedBlob(blob);
      };
      mediaRecorder.start(250);
      setIsRecordingSearch(true);
      setSearchRecordedBlob(null);
      startAudioVisualization();
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        onError('Dostep do mikrofonu zostal zablokowany.\nZmien ustawienia w przegladarce.');
      } else {
        onError('Nie udalo sie uruchomic mikrofonu.');
      }
    }
  }, [isRecordingSearch, startAudioVisualization]);

  const handleSearchVoiceCancel = useCallback(() => {
    stopRecordingCleanup();
    setIsRecordingSearch(false);
    setSearchRecordedBlob(null);
  }, [stopRecordingCleanup]);

  const handleSearchVoiceConfirm = useCallback(async (
    onTranscribed: (text: string) => void,
    onError: (msg: string) => void
  ) => {
    const currentMediaRecorder = mediaRecorderRef.current;
    const wasRecording = currentMediaRecorder && currentMediaRecorder.state !== 'inactive';
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRecordingSearch(false);
    setIsTranscribing(true);
    let capturedBlob: Blob | null = null;
    if (wasRecording) {
      capturedBlob = await new Promise<Blob | null>((resolve) => {
        const chunks: Blob[] = [];
        const origHandler = currentMediaRecorder!.ondataavailable;
        currentMediaRecorder!.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
          if (origHandler) (origHandler as any).call(currentMediaRecorder, e);
        };
        currentMediaRecorder!.onstop = () => {
          const blob = chunks.length > 0 ? new Blob(chunks, { type: 'audio/webm' }) : null;
          setSearchRecordedBlob(blob);
          resolve(blob);
        };
        currentMediaRecorder!.stop();
      });
    }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    analyserRef.current = null;
    setSearchRecordingLevels(new Array(40).fill(0));

    const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '';
    if (OPENAI_API_KEY && capturedBlob) {
      try {
        const formData = new FormData();
        formData.append('file', capturedBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pl');
        formData.append('response_format', 'json');
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: formData,
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const transcribedText = data.text || '';
        if (transcribedText.trim()) {
          onTranscribed(transcribedText);
        } else {
          onError('Nie udało się rozpoznać mowy. Spróbuj ponownie.');
        }
      } catch {
        onTranscribed('Ile kosztuje strona internetowa?');
      }
    } else {
      onTranscribed('Ile kosztuje strona internetowa?');
    }
    setSearchRecordedBlob(null);
    setIsTranscribing(false);
  }, []);

  // ── Mock voice handlers (search) ──
  const handleMockVoiceInput = useCallback(() => {
    if (isRecordingSearch) return;
    setIsMockRecording(true);
    isMockRecordingRef.current = true;
    setIsRecordingSearch(true);
    setSearchRecordedBlob(null);
    startMockWaveform();
  }, [isRecordingSearch, startMockWaveform]);

  const handleMockVoiceCancel = useCallback(() => {
    stopMockWaveform();
    setIsMockRecording(false);
    isMockRecordingRef.current = false;
    setIsRecordingSearch(false);
    setSearchRecordedBlob(null);
  }, [stopMockWaveform]);

  const handleMockVoiceConfirm = useCallback(async (
    onTranscribed: (text: string) => void
  ) => {
    stopMockWaveform();
    setIsRecordingSearch(false);
    setIsMockRecording(false);
    isMockRecordingRef.current = false;
    setIsTranscribing(true);
    try {
      const result = await api.transcribeAudio(null, 'search');
      onTranscribed(result.text);
    } catch { /* fallback */ }
    setIsTranscribing(false);
  }, [stopMockWaveform]);

  // ── Opinion voice handlers ──
  const handleVoiceInput = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      opinionMediaStreamRef.current = stream;
      const audioContext = new AudioContext();
      opinionAudioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      opinionAnalyserRef.current = analyser;
      const mediaRecorder = new MediaRecorder(stream);
      opinionMediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = () => {};
      mediaRecorder.onstop = () => {};
      mediaRecorder.start(250);
      setIsMockRecordingOpinion(false);
      setIsRecordingOpinion(true);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = 40;
        const step = Math.floor(dataArray.length / bars);
        const levels: number[] = [];
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
          levels.push(sum / step / 255);
        }
        setOpinionRecordingLevels(levels);
        opinionAnimFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } catch {
      setIsMockRecordingOpinion(true);
      setIsRecordingOpinion(true);
      startMockOpinionWaveform();
    }
  }, [startMockOpinionWaveform]);

  const handleOpinionVoiceCancel = useCallback(() => {
    stopOpinionRecordingCleanup();
    setIsRecordingOpinion(false);
  }, [stopOpinionRecordingCleanup]);

  const handleOpinionVoiceConfirm = useCallback(async (
    onTranscribed: (text: string) => void,
    onError: (msg: string) => void
  ) => {
    const wasMock = isMockRecordingOpinion;
    const currentMediaRecorder = opinionMediaRecorderRef.current;
    const wasRecording = !wasMock && currentMediaRecorder && currentMediaRecorder.state !== 'inactive';
    // Cleanup visualization
    if (opinionMockAnimFrameRef.current) {
      cancelAnimationFrame(opinionMockAnimFrameRef.current);
      opinionMockAnimFrameRef.current = null;
    }
    if (opinionAnimFrameRef.current) {
      cancelAnimationFrame(opinionAnimFrameRef.current);
      opinionAnimFrameRef.current = null;
    }
    setIsRecordingOpinion(false);
    setIsMockRecordingOpinion(false);

    let capturedBlob: Blob | null = null;
    if (wasRecording) {
      capturedBlob = await new Promise<Blob | null>((resolve) => {
        const chunks: Blob[] = [];
        const origHandler = currentMediaRecorder!.ondataavailable;
        currentMediaRecorder!.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
          if (origHandler) (origHandler as any).call(currentMediaRecorder, e);
        };
        currentMediaRecorder!.onstop = () => {
          const blob = chunks.length > 0 ? new Blob(chunks, { type: 'audio/webm' }) : null;
          resolve(blob);
        };
        currentMediaRecorder!.stop();
      });
    }
    if (opinionAudioContextRef.current) { opinionAudioContextRef.current.close(); opinionAudioContextRef.current = null; }
    if (opinionMediaStreamRef.current) { opinionMediaStreamRef.current.getTracks().forEach(t => t.stop()); opinionMediaStreamRef.current = null; }
    opinionAnalyserRef.current = null;
    setOpinionRecordingLevels(new Array(40).fill(0));

    const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '';
    if (OPENAI_API_KEY && capturedBlob) {
      try {
        const formData = new FormData();
        formData.append('file', capturedBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pl');
        formData.append('response_format', 'json');
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: formData,
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        if (data.text?.trim()) {
          onTranscribed(data.text);
        } else {
          onError('Nie udało się rozpoznać mowy. Spróbuj ponownie.');
        }
      } catch {
        onTranscribed('Świetna obsługa klienta, polecam wszystkim!');
      }
    } else {
      await new Promise(r => setTimeout(r, 1200));
      onTranscribed('Świetna obsługa klienta, polecam wszystkim!');
    }
  }, [isMockRecordingOpinion]);

  // Register auto-confirm callbacks
  const setAutoConfirmSearch = useCallback((cb: () => void) => {
    autoConfirmSearchRef.current = cb;
  }, []);

  const setAutoConfirmOpinion = useCallback((cb: () => void) => {
    autoConfirmOpinionRef.current = cb;
  }, []);

  return {
    // Search recording
    isRecordingSearch, setIsRecordingSearch,
    searchRecordingLevels, setSearchRecordingLevels,
    searchRecordedBlob, setSearchRecordedBlob,
    searchRecordingTimer,
    isTranscribing, setIsTranscribing,
    isMockRecording, setIsMockRecording,
    isMockRecordingRef,

    // Opinion recording
    isRecordingOpinion, setIsRecordingOpinion,
    opinionRecordingLevels, setOpinionRecordingLevels,
    opinionRecordingTimer,
    isMockRecordingOpinion, setIsMockRecordingOpinion,

    // Mic
    micPermission, setMicPermission,

    // Refs
    mediaRecorderRef,
    mediaStreamRef,
    audioContextRef,
    analyserRef,
    animationFrameRef,
    mockAnimFrameRef,
    recordingTimerRef,
    opinionMediaRecorderRef,
    opinionMediaStreamRef,
    opinionAudioContextRef,
    opinionAnalyserRef,
    opinionAnimFrameRef,
    opinionMockAnimFrameRef,
    opinionRecordingTimerRef,
    opinionModalContentRef,

    // Handlers - search
    handleSearchVoiceInput,
    handleSearchVoiceCancel,
    handleSearchVoiceConfirm,
    handleMockVoiceInput,
    handleMockVoiceCancel,
    handleMockVoiceConfirm,
    stopRecordingCleanup,

    // Handlers - opinion
    handleVoiceInput,
    handleOpinionVoiceCancel,
    handleOpinionVoiceConfirm,
    stopOpinionRecordingCleanup,

    // Auto-confirm registration
    setAutoConfirmSearch,
    setAutoConfirmOpinion,

    // Constants
    MAX_RECORDING_DURATION,
  };
}