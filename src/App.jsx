import React, { useState, useEffect, useRef } from "react";
import { Container, Title, Stack, Tabs, Text, Loader } from "@mantine/core";
import { QRCodeCanvas } from "qrcode.react";
import io from "socket.io-client";
import SessionSelector from "./components/SessionSelector";
import SendMessageForm from "./components/SendMessageForm";
import BulkSender from "./components/BulkSender";

const BACKEND_URL = "http://localhost:3000";

function App() {
  const [clientId, setClientId] = useState("");
  const [inputId, setInputId] = useState("");
  const [qr, setQr] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    const lastId = localStorage.getItem("clientId");
    if (lastId) setInputId(lastId);
  }, []);

  useEffect(() => {
    if (!clientId) return;
    setError("");
    localStorage.setItem("clientId", clientId);
    const socket = io(BACKEND_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { clientId });
    });

    socket.on("qr", (data) => setQr(data.qr));
    socket.on("status", (data) => {
      setStatus(data.status);
      if (data.status === "ready") setQr("");
      if (data.status === "auth_failure") setError("Error de autenticación, intenta de nuevo");
      if (data.status === "disconnected") setError("Sesión desconectada, vuelve a conectar");
    });

    return () => socket.disconnect();
  }, [clientId]);

  // Cerrar sesión y limpiar estado
  const handleLogout = async () => {
    setStatus("Sesión cerrada");
    setClientId("");
    setQr("");
    localStorage.removeItem("clientId");
  };

  return (
    <Container fluid mt={40}>
      <Stack gap="md" align="center">
        <Title order={2}>WA Multi-sesión <Text span c="blue">Geniality</Text></Title>
        <Tabs defaultValue="sesiones" w="100%">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="sesiones">Sesiones</Tabs.Tab>
            <Tabs.Tab value="enviar" disabled={!clientId}>Enviar Mensaje</Tabs.Tab>
            <Tabs.Tab value="masivo" disabled={!clientId}>Envío Masivo</Tabs.Tab>
          </Tabs.List>
          {/* Sesiones */}
          <Tabs.Panel value="sesiones">
            <SessionSelector
              clientId={clientId}
              inputId={inputId}
              setInputId={setInputId}
              setClientId={setClientId}
              status={status}
              setError={setError}
              error={error}
              handleLogout={handleLogout}
            />
            {clientId && status !== "ready" && qr && (
              <Stack align="center" gap={0} mt="lg">
                <QRCodeCanvas value={qr} size={220} style={{ margin: "auto" }} />
                <Text size="xs" c="gray" mt={4}>
                  Escanea rápido antes de que expire
                </Text>
              </Stack>
            )}
            {clientId && !qr && status !== "ready" && <Loader size="md" mt="lg" />}
          </Tabs.Panel>
          {/* Envío individual */}
          <Tabs.Panel value="enviar">
            {status === "ready" ? (
              <SendMessageForm clientId={clientId} />
            ) : (
              <Text c="gray">Conecta primero una sesión y espera el estado listo</Text>
            )}
          </Tabs.Panel>
          {/* Envío masivo */}
          <Tabs.Panel value="masivo">
            <BulkSender clientId={clientId} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}

export default App;
