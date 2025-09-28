import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTelemedicineClient } from './useTelemedicineClient'

// Mock WebRTCClient
vi.mock('../webrtc-client', () => {
  const mockClient = {
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    startLocalStream: vi.fn(),
    stopLocalStream: vi.fn(),
    getConnectionState: vi.fn(() => 'disconnected'),
    getPeerConnections: vi.fn(() => new Map()),
    getLocalStream: vi.fn(() => null),
    isAudioEnabled: vi.fn(() => false),
    isVideoEnabled: vi.fn(() => false),
    toggleAudio: vi.fn(() => true),
    toggleVideo: vi.fn(() => true)
  }

  return {
    WebRTCClient: vi.fn(() => mockClient)
  }
})

// Mock MediaStream
Object.defineProperty(global, 'MediaStream', {
  writable: true,
  value: vi.fn(() => ({
    getTracks: vi.fn(() => []),
    getVideoTracks: vi.fn(() => []),
    getAudioTracks: vi.fn(() => [])
  }))
})

describe('useTelemedicineClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useTelemedicineClient('test-room', 'test-user', 'patient')
    )

    expect(result.current.client).toBeTruthy()
    expect(result.current.connectionState).toBe('disconnected')
    expect(result.current.localStream).toBeNull()
    expect(result.current.remoteStreams).toEqual(new Map())
    expect(result.current.error).toBeNull()
    expect(result.current.isConnecting).toBe(false)
    expect(result.current.reconnectAttempts).toBe(0)
  })

  it('should provide connect function', () => {
    const { result } = renderHook(() =>
      useTelemedicineClient('test-room', 'test-user', 'patient')
    )

    expect(typeof result.current.connect).toBe('function')
    expect(typeof result.current.disconnect).toBe('function')
    expect(typeof result.current.startLocalStream).toBe('function')
    expect(typeof result.current.stopLocalStream).toBe('function')
  })

  it('should call connect on client when connect is called', async () => {
    const { result } = renderHook(() =>
      useTelemedicineClient('test-room', 'test-user', 'patient')
    )

    const mockConnect = result.current.client?.connect as any
    mockConnect.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.connect()
    })

    expect(mockConnect).toHaveBeenCalledWith('test-room')
  })

  it('should handle connection errors', async () => {
    const { result } = renderHook(() =>
      useTelemedicineClient('test-room', 'test-user', 'patient')
    )

    const mockConnect = result.current.client?.connect as any
    const error = new Error('Connection failed')
    mockConnect.mockRejectedValueOnce(error)

    await act(async () => {
      try {
        await result.current.connect()
      } catch (e) {
        // Expected to throw
      }
    })

    await waitFor(() => {
      expect(result.current.error).toEqual(error)
    })
  })

  it('should call startLocalStream with constraints', async () => {
    const { result } = renderHook(() =>
      useTelemedicineClient('test-room', 'test-user', 'patient')
    )

    const mockStartLocalStream = result.current.client?.startLocalStream as any
    const mockStream = new MediaStream()
    mockStartLocalStream.mockResolvedValueOnce(mockStream)

    const constraints = { video: true, audio: false }

    await act(async () => {
      await result.current.startLocalStream(constraints)
    })

    expect(mockStartLocalStream).toHaveBeenCalledWith(constraints)
  })

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useTelemedicineClient('test-room', 'test-user', 'patient')
    )

    const mockDisconnect = result.current.client?.disconnect as any

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('should handle auto-connect option', () => {
    const { result } = renderHook(() =>
      useTelemedicineClient('test-room', 'test-user', 'patient', { autoConnect: true })
    )

    const mockConnect = result.current.client?.connect as any
    expect(mockConnect).toHaveBeenCalledWith('test-room')
  })
})