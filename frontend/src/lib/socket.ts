import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      const workspaceId = localStorage.getItem('echodesk_workspace_id');
      if (workspaceId) {
        socket?.emit('join:workspace', workspaceId);
      }
    });
  }
  return socket;
}

export function subscribeToRecording(recordingId: string, onUpdate: (data: any) => void) {
  const s = getSocket();
  s.emit('join:recording', recordingId);

  const handleStatus = (data: any) => {
    if (data.recordingId === recordingId) {
      onUpdate({ type: 'status_change', ...data });
    }
  };

  const handleCompleted = (data: any) => {
    if (data.recordingId === recordingId) {
      onUpdate({ type: 'completed', ...data });
    }
  };

  const handleError = (data: any) => {
    if (data.recordingId === recordingId) {
      onUpdate({ type: 'error', ...data });
    }
  };

  s.on('recording:status_change', handleStatus);
  s.on('recording:completed', handleCompleted);
  s.on('recording:error', handleError);

  return () => {
    s.off('recording:status_change', handleStatus);
    s.off('recording:completed', handleCompleted);
    s.off('recording:error', handleError);
  };
}
