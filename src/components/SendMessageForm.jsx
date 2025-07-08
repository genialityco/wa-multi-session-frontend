import { useState } from "react";
import { Paper, Stack, TextInput, Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

export default function SendMessageForm({ clientId }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!phone || !message) {
      showNotification({
        color: "red",
        title: "Faltan datos",
        message: "Debes ingresar el número y el mensaje",
      });
      return;
    }
    setSending(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/send`, {
        clientId,
        phone,
        message,
      });
      showNotification({
        color: "green",
        title: "Mensaje enviado",
        message: `ID: ${res.data.id || "ok"}`,
      });
      setMessage("");
    } catch (err) {
      showNotification({
        color: "red",
        title: "Error al enviar",
        message: err.response?.data?.error || err.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper
      shadow="xs"
      radius="md"
      p="md"
      withBorder
      mt="md"
      style={{ width: "100%" }}
    >
      <Stack gap="sm">
        <TextInput
          label="Número de teléfono (incluye país, ej: 57300xxxxxxx)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextInput
          label="Mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message) handleSendMessage();
          }}
        />
        <Button
          fullWidth
          color="blue"
          onClick={handleSendMessage}
          loading={sending}
          disabled={!phone || !message}
        >
          Enviar mensaje
        </Button>
      </Stack>
    </Paper>
  );
}
