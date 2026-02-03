import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Card,
  Badge,
  Grid,
  ActionIcon,
  Container,
  Stack,
  Loader,
  Paper,
  Alert,
  ThemeIcon
} from "@mantine/core";
import { IconPlugConnected, IconTrash, IconRefresh, IconPlus, IconDeviceMobile } from "@tabler/icons-react";
import { QRCodeCanvas } from "qrcode.react";
import { getSessions, connectSession } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import { notifications } from '@mantine/notifications';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [activeSession, setActiveSession] = useState(localStorage.getItem("clientId") || "");
  
  // Use our custom hook
  const { status, qr, error, socket } = useSocket(activeSession);

  // Fetch sessions
  const fetchSessions = () => {
    getSessions()
      .then((data) => setSessions(data))
      .catch(() => {
        notifications.show({
            title: 'Error',
            message: 'No se pudieron cargar las sesiones',
            color: 'red'
        });
      });
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Polling for list updates
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async (name) => {
    if (!name) return;
    try {
      // Connect in backend
      await connectSession(name);
      // Set local state to trigger hook
      setActiveSession(name);
      localStorage.setItem("clientId", name);
      notifications.show({
        title: 'Conectando...',
        message: `Iniciando sesión: ${name}`,
        color: 'blue'
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || err.message,
        color: 'red'
      });
    }
  };

  const handleLogout = () => {
    setActiveSession("");
    localStorage.removeItem("clientId");
    // Optionally call backend logout if API exists, but usually just disconnecting socket is enough for UI reset
    notifications.show({
        title: 'Desconectado',
        message: 'Has cerrado la sesión actual en el visor',
        color: 'yellow'
    });
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Gestión de Sesiones</Title>

      <Grid>
        {/* Left Column: Create / Active Status */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack>
            {/* New Session Card */}
            <Card shadow="sm" radius="md" p="lg" withBorder>
              <Text fw={600} mb="xs">Nueva Sesión</Text>
              <Group>
                <TextInput 
                  placeholder="Nombre ej: Ventas" 
                  style={{ flex: 1 }}
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                />
                <Button 
                    onClick={() => {
                        handleConnect(newSessionName);
                        setNewSessionName("");
                    }}
                    disabled={!newSessionName}
                >
                    <IconPlus size={18} />
                </Button>
              </Group>
            </Card>

            {/* Active Session Status */}
            {activeSession && (
               <Paper shadow="md" radius="md" p="xl" withBorder style={{ borderColor: status === 'ready' ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-orange-6)' }}>
                  <Group justify="space-between" mb="md">
                      <Group>
                          <IconDeviceMobile size={24} />
                          <Stack gap={0}>
                            <Text size="sm" c="dimmed">Sesión Actual</Text>
                            <Text fw={700} size="lg">{activeSession}</Text>
                          </Stack>
                      </Group>
                      <Badge size="lg" color={status === 'ready' ? 'teal' : 'yellow'}>{status}</Badge>
                  </Group>

                  {qr && status !== 'ready' && (
                      <Stack align="center" my="md">
                          <Paper p="sm" bg="white" radius="md">
                             <QRCodeCanvas value={qr} size={200} />
                          </Paper>
                          <Text size="xs" c="dimmed">Escanea con tu WhatsApp</Text>
                      </Stack>
                  )}

                  {!qr && status !== 'ready' && (
                      <Stack align="center" my="xl">
                          <Loader size="lg" type="dots" />
                          <Text size="sm">Esperando estado...</Text>
                      </Stack>
                  )}

                  {error && (
                      <Alert color="red" title="Error" mb="md">
                          {error}
                      </Alert>
                  )}

                  <Button color="red" variant="light" fullWidth onClick={handleLogout} mt="md">
                      Desconectar del Visor
                  </Button>
               </Paper>
            )}
          </Stack>
        </Grid.Col>

        {/* Right Column: Sessions List */}
        <Grid.Col span={{ base: 12, md: 7 }}>
            <Text fw={600} mb="sm">Sesiones Disponibles en el Servidor</Text>
            {sessions.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">No hay sesiones activas encontradas.</Text>
            ) : (
                <Stack>
                    {sessions.map((s) => (
                        <Card key={s.clientId} shadow="xs" radius="md" padding="sm" withBorder>
                            <Group justify="space-between">
                                <Group>
                                    <ThemeIcon variant="light" color={s.status === 'ready' ? 'teal' : 'gray'}>
                                        <IconBrandWhatsapp size={18} />
                                    </ThemeIcon>
                                    <Text fw={500}>{s.clientId}</Text>
                                </Group>
                                <Group gap="xs">
                                    <Badge variant="dot" color={s.status === 'ready' ? 'green' : 'gray'}>
                                        {s.status || 'unknown'}
                                    </Badge>
                                    <Button 
                                        size="xs" 
                                        variant="subtle" 
                                        onClick={() => handleConnect(s.clientId)}
                                        disabled={activeSession === s.clientId}
                                    >
                                        {activeSession === s.clientId ? 'Activa' : 'Conectar'}
                                    </Button>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}

// Helper icon import fix if needed, but imported correctly above
import { IconBrandWhatsapp } from "@tabler/icons-react";
