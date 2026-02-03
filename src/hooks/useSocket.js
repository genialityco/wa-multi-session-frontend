import { useState, useEffect, useRef } from 'react';
import { initiateSocketConnection, disconnectSocket } from '../services/socket';

export const useSocket = (clientId) => {
  const [status, setStatus] = useState("disconnected");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!clientId) return;

    // Reset states on new client
    setStatus("disconnected");
    setQr("");
    setError("");

    const socket = initiateSocketConnection();
    socketRef.current = socket;

    // Explicit join event as per original code
    socket.on("connect", () => {
        socket.emit("join", { clientId });
    });

    socket.on("qr", (data) => {
        setQr(data.qr);
        setStatus("qrcode"); 
    });

    socket.on("status", (data) => {
        setStatus(data.status);
        if (data.status === "ready") setQr("");
        if (data.status === "auth_failure") setError("Error de autenticación");
        if (data.status === "disconnected") setError("Sesión desconectada");
    });

    return () => {
        disconnectSocket();
    };
  }, [clientId]);

  return { status, qr, error, socket: socketRef.current };
};
