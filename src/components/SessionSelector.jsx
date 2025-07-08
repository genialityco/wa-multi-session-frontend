import { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Table,
  Notification,
  Text,
  Group,
} from "@mantine/core";
import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

export default function SessionSelector({
  clientId,
  inputId,
  setInputId,
  setClientId,
  status,
  setError,
  error,
  handleLogout,
}) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!clientId) {
      axios
        .get(`${BACKEND_URL}/api/sessions`)
        .then((res) => setSessions(res.data))
        .catch(() => setSessions([]));
    }
  }, [clientId]);

  const handleConnectSession = async (id = null) => {
    const connectId = id || inputId;
    if (!connectId) {
      setError("Debes ingresar un nombre de sesión");
      return;
    }
    setError("");
    try {
      await axios.post(`${BACKEND_URL}/api/session`, { clientId: connectId });
      setClientId(connectId);
    } catch (err) {
      setError(
        "Error al conectar: " + (err.response?.data?.error || err.message)
      );
    }
  };

  return !clientId ? (
    <>
      <TextInput
        label="Nombre de la sesión"
        placeholder="Ej: juan, bot1, etc."
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleConnectSession()}
        autoFocus
      />
      <Button fullWidth onClick={() => handleConnectSession()} mt="sm">
        Conectar a sesión
      </Button>
      <Text fw={500} mt="md" mb={6}>
        Sesiones activas
      </Text>
<Table highlightOnHover>
  <Table.Thead>
    <Table.Tr>
      <Table.Th>Sesión</Table.Th>
      <Table.Th>Estado</Table.Th>
      <Table.Th>Acción</Table.Th>
    </Table.Tr>
  </Table.Thead>
  <Table.Tbody>
    {sessions.map((s) => (
      <Table.Tr key={s.clientId}>
        <Table.Td>{s.clientId}</Table.Td>
        <Table.Td>{s.status}</Table.Td>
        <Table.Td>
          <Button
            size="xs"
            variant="light"
            onClick={() => handleConnectSession(s.clientId)}
          >
            Conectar
          </Button>
        </Table.Td>
      </Table.Tr>
    ))}
  </Table.Tbody>
</Table>

      {error && (
        <Notification color="red" mt="sm">
          {error}
        </Notification>
      )}
    </>
  ) : (
    <>
      <Group gap="xs" justify="center">
        <Text fw={500}>Sesión:</Text>
        <Text c="blue">{clientId}</Text>
      </Group>
      <Text size="sm" c={status === "ready" ? "green" : "gray"}>
        Status: {status}
      </Text>
      <Button
        fullWidth
        color="red"
        variant="outline"
        mt="md"
        onClick={handleLogout}
      >
        Cerrar sesión
      </Button>
      {error && (
        <Notification color="red" mt="sm">
          {error}
        </Notification>
      )}
    </>
  );
}
