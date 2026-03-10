import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Button,
  Table,
  Group,
  TextInput,
  Stack,
  Modal,
  ActionIcon,
  Badge,
  Text,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import { IconPlus, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { registerAccount, removeAccount, listAccounts } from '../services/api';

function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    phoneNumberId: '',
    accessToken: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await listAccounts();
      setAccounts(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar las cuentas',
        color: 'red',
        icon: <IconAlertCircle />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.accountId || !formData.phoneNumberId || !formData.accessToken) {
      notifications.show({
        title: 'Error',
        message: 'Todos los campos son obligatorios',
        color: 'red',
        icon: <IconAlertCircle />
      });
      return;
    }

    try {
      setSubmitting(true);
      await registerAccount(
        formData.accountId,
        formData.phoneNumberId,
        formData.accessToken
      );
      
      notifications.show({
        title: 'Éxito',
        message: 'Cuenta registrada exitosamente',
        color: 'green'
      });

      setModalOpened(false);
      setFormData({ accountId: '', phoneNumberId: '', accessToken: '' });
      loadAccounts();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Error al registrar la cuenta',
        color: 'red',
        icon: <IconAlertCircle />
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (accountId) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta?')) {
      return;
    }

    try {
      await removeAccount(accountId);
      
      notifications.show({
        title: 'Éxito',
        message: 'Cuenta eliminada exitosamente',
        color: 'green'
      });

      loadAccounts();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Error al eliminar la cuenta',
        color: 'red',
        icon: <IconAlertCircle />
      });
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Gestión de Cuentas</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            Registrar Cuenta
          </Button>
        </Group>

        {accounts.length === 0 ? (
          <Alert icon={<IconAlertCircle />} title="Sin cuentas" color="blue">
            No hay cuentas registradas. Haz clic en "Registrar Cuenta" para agregar una.
          </Alert>
        ) : (
          <Paper shadow="sm" p="md" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Account ID</Table.Th>
                  <Table.Th>Phone Number ID</Table.Th>
                  <Table.Th>Access Token</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {accounts.map((account) => (
                  <Table.Tr key={account.accountId}>
                    <Table.Td>
                      <Badge variant="light">{account.accountId}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{account.phoneNumberId}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" truncate="end" maw={300}>
                        {account.accessToken}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleRemove(account.accountId)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Registrar Nueva Cuenta"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Account ID"
            placeholder="Ingresa el Account ID"
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            required
          />
          <TextInput
            label="Phone Number ID"
            placeholder="Ingresa el Phone Number ID"
            value={formData.phoneNumberId}
            onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
            required
          />
          <TextInput
            label="Access Token"
            placeholder="Ingresa el Access Token"
            value={formData.accessToken}
            onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setModalOpened(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegister} loading={submitting}>
              Registrar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default AccountsPage;
