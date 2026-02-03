import React, { useState } from 'react';
import { Title, Tabs, Paper, TextInput, Textarea, Button, FileInput, Text, Group, Table, Progress, Alert, Stack, rem } from '@mantine/core';
import { IconMessage, IconFiles, IconUpload, IconSend, IconDownload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import * as XLSX from 'xlsx';
import { sendMessage, BACKEND_URL } from '../services/api';
import axios from 'axios';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('individual');
  const [activeSession] = useState(localStorage.getItem("clientId"));

  return (
    <Stack>
        <Title order={2}>Centro de Mensajería</Title>
        <Paper p="md" radius="md" withBorder shadow="sm">
            {!activeSession ? (
                <Alert color="orange" title="Sin Sesión Activa">
                    Debes seleccionar una sesión activa en la página principal para enviar mensajes.
                </Alert>
            ) : (
                <Tabs value={activeTab} onChange={setActiveTab} color="teal">
                    <Tabs.List>
                        <Tabs.Tab value="individual" leftSection={<IconMessage size={16} />}>
                            Envío Individual
                        </Tabs.Tab>
                        <Tabs.Tab value="bulk" leftSection={<IconFiles size={16} />}>
                            Envío Masivo
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="individual" pt="xl">
                        <IndividualSender clientId={activeSession} />
                    </Tabs.Panel>

                    <Tabs.Panel value="bulk" pt="xl">
                        <BulkSender clientId={activeSession} />
                    </Tabs.Panel>
                </Tabs>
            )}
        </Paper>
    </Stack>
  );
}

function IndividualSender({ clientId }) {
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!phone || !message) return;
        setLoading(true);
        try {
            await sendMessage(clientId, phone, message);
            notifications.show({
                title: 'Mensaje enviado',
                message: `Mensaje enviado a ${phone}`,
                color: 'green'
            });
            setMessage("");
            setPhone("");
        } catch (err) {
            notifications.show({
                title: 'Error al enviar',
                message: err.response?.data?.error || err.message,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack maxWidth={500}>
            <TextInput 
                label="Número de Teléfono" 
                placeholder="Ej: 573001234567" 
                description="Incluye el código de país sin espacios ni +"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <Textarea 
                label="Mensaje" 
                placeholder="Escribe tu mensaje aquí..." 
                minRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <Button 
                leftSection={<IconSend size={16} />} 
                onClick={handleSend} 
                loading={loading}
                disabled={!phone || !message}
            >
                Enviar Mensaje
            </Button>
        </Stack>
    );
}

function BulkSender({ clientId }) {
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkData, setBulkData] = useState([]);
    const [bulkProgress, setBulkProgress] = useState(0);
    const [bulkSending, setBulkSending] = useState(false);
    const [report, setReport] = useState([]);

    const handleFileChange = (file) => {
        setBulkFile(file);
        setReport([]);
        if (!file) {
            setBulkData([]);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            setBulkData(json);
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { phone: "573001112233", message: "Hola Mundo", image: "https://..." },
            { phone: "573001112244", message: "Hola #2", image: "" },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buf], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_envio_masivo.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleSendBulk = async () => {
        if (!bulkData.length) return;
        setBulkSending(true);
        setBulkProgress(0);
        let sent = 0;
        const rep = [];

        for (let row of bulkData) {
            const phoneClean = String(row.phone).replace(/\s/g, "");
            let result = {
                phone: phoneClean,
                message: row.message,
                status: "",
                error: "",
            };
            try {
                // Using axios directly here to match original logic or can reuse api service if refactored to support custom endpoints easily
                // Reusing the one from api.js but it expects specific params. 
                // Let's use direct axios call for now to keep 'image' param and 1.8s delay logic simple
                await axios.post(`${BACKEND_URL}/api/send`, {
                    clientId,
                    phone: phoneClean,
                    message: row.message,
                    image: row.image || undefined,
                });

                // Actually, let's look at services/api.js again.
                // BACKEND_URL is exported as API_URL which is the domain.
                // So full path is `${BACKEND_URL}/api/send`
                 
                result.status = "Enviado";
            } catch (err) {
                result.status = "Error";
                result.error = err.response?.data?.error || err.message;
            }
            rep.push(result);
            sent++;
            setBulkProgress(Math.round((sent / bulkData.length) * 100));
            setReport([...rep]);
            await new Promise((r) => setTimeout(r, 1800));
        }
        setBulkSending(false);
        notifications.show({
            title: 'Proceso completado',
            message: `Se procesaron ${sent} mensajes`,
            color: 'blue'
        });
    };

    return (
        <Stack>
            <Group align="flex-end">
                <FileInput
                    label="Archivo Excel"
                    description="Columnas requeridas: phone, message"
                    placeholder="Seleccionar archivo..."
                    accept=".xlsx, .xls"
                    value={bulkFile}
                    onChange={handleFileChange}
                    leftSection={<IconUpload size={16} />}
                    style={{ flex: 1 }}
                />
                <Button variant="outline" onClick={downloadTemplate} leftSection={<IconDownload size={16} />}>
                    Plantilla
                </Button>
            </Group>

            {bulkData.length > 0 && (
                <>
                    <Text size="sm" fw={500} mt="md">Vista Previa ({bulkData.length} registros)</Text>
                    <Table.ScrollContainer minWidth={500} maxHeight={300}>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Teléfono</Table.Th>
                                    <Table.Th>Mensaje</Table.Th>
                                    <Table.Th>Imagen</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {bulkData.slice(0, 10).map((row, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{row.phone}</Table.Td>
                                        <Table.Td>{row.message}</Table.Td>
                                        <Table.Td>{row.image ? 'Sí' : '-'}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>

                    <Button 
                        color="teal" 
                        fullWidth 
                        mt="md" 
                        onClick={handleSendBulk} 
                        loading={bulkSending}
                        disabled={bulkSending}
                    >
                        Iniciar Envío Masivo
                    </Button>
                    
                    {bulkSending && <Progress value={bulkProgress} animated size="xl" mt="sm" radius="xl" />}
                </>
            )}

            {report.length > 0 && (
               <Stack mt="xl">
                   <Text fw={600}>Reporte de Envío</Text>
                   <Table.ScrollContainer minWidth={500} maxHeight={400}>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Teléfono</Table.Th>
                                    <Table.Th>Estado</Table.Th>
                                    <Table.Th>Detalle</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {report.map((row, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{row.phone}</Table.Td>
                                        <Table.Td style={{ color: row.status === 'Enviado' ? 'green' : 'red' }}>
                                            {row.status}
                                        </Table.Td>
                                        <Table.Td>{row.error}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                   </Table.ScrollContainer>
               </Stack>
            )}
        </Stack>
    );
}

