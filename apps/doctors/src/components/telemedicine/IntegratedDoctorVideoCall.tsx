'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor
} from 'lucide-react';

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
}

interface IntegratedDoctorVideoCallProps {
  sessionId: string;
  patientData: PatientData;
}

export default function IntegratedDoctorVideoCall({
  sessionId,
  patientData
}: IntegratedDoctorVideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize camera
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        setIsConnected(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsConnected(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col">
      {/* Video call area */}
      <div className="bg-gray-800 rounded-lg overflow-hidden h-96 mb-6 relative">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : ''}`}
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">Cámara no activada</p>
            </div>
          </div>
        )}

        {/* Video controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-full">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </button>

            <button className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors">
              <Monitor className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Status overlay */}
        {stream && (
          <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="flex items-center space-x-3 text-sm text-white">
              <span className="text-green-400">● HD</span>
              <span>|</span>
              <span className="text-blue-400">45ms</span>
              <span>|</span>
              <span className={isConnected ? 'text-green-400' : 'text-yellow-400'}>
                {isConnected ? 'Conectado' : 'Conectando...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Patient info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">{patientData.name}</h3>
            <p className="text-gray-400">{patientData.age} años • Consulta General</p>
            <p className="text-gray-500 text-xs">Sesión: {sessionId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-green-400 font-bold">HD</div>
              <div className="text-gray-500 text-xs">Calidad</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">15:30</div>
              <div className="text-gray-500 text-xs">Duración</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
