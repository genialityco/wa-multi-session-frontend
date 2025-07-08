import { useState } from "react";
import {
  Paper,
  Stack,
  FileInput,
  Text,
  Button,
  Progress,
  Table,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import * as XLSX from "xlsx";
import axios from "axios";

// const BACKEND_URL = "http://localhost:3000";
const BACKEND_URL ="https://apiwhatsapp.geniality.com.co";
// const BACKEND_URL = "http://64.23.199.147:3000";

function downloadTemplate() {
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
}

export default function BulkSender({ clientId }) {
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkSending, setBulkSending] = useState(false);
  const [report, setReport] = useState([]);

  // Leer archivo Excel y cargar bulkData
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

  // Enviar mensajes masivos con delay e informe
  // Enviar mensajes masivos con delay e informe
  const handleSendBulk = async () => {
    if (!bulkData.length) {
      showNotification({
        color: "red",
        title: "No hay datos",
        message: "Primero carga un Excel válido",
      });
      return;
    }
    setBulkSending(true);
    setBulkProgress(0);
    let sent = 0;
    const rep = [];
    for (let row of bulkData) {
      // Asegura que phone es string y sin espacios
      const phoneClean = String(row.phone).replace(/\s/g, "");
      let result = {
        phone: phoneClean,
        message: row.message,
        status: "",
        error: "",
      };
      try {
        await axios.post(`${BACKEND_URL}/api/send`, {
          clientId,
          phone: phoneClean,
          message: row.message,
          image: row.image || undefined,
        });
        result.status = "Enviado";
      } catch (err) {
        result.status = "Error";
        result.error = err.response?.data?.error || err.message;
      }
      rep.push(result);
      sent++;
      setBulkProgress(Math.round((sent / bulkData.length) * 100));
      setReport([...rep]);
      await new Promise((r) => setTimeout(r, 1800)); // 1.8 segundos de delay entre envíos
    }
    setBulkSending(false);
    showNotification({
      color: "green",
      title: "Envío masivo terminado",
      message: `Se enviaron ${sent} mensajes`,
    });
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
        <Group>
          <FileInput
            label="Archivo Excel"
            accept=".xlsx, .xls"
            value={bulkFile}
            onChange={handleFileChange}
            placeholder="Selecciona tu Excel"
          />
          <Button onClick={downloadTemplate} variant="light">
            Descargar plantilla
          </Button>
        </Group>
        <Text size="xs" c="dimmed">
          El Excel debe tener columnas: <b>phone</b>, <b>message</b>,{" "}
          <b>image</b> (opcional, url/base64)
        </Text>
        {bulkData.length > 0 && (
          <>
            <Text size="xs" mb={4}>
              Preview ({bulkData.length} mensajes):
            </Text>
            <Table withColumnBorders striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Teléfono</Table.Th>
                  <Table.Th>Mensaje</Table.Th>
                  <Table.Th>Imagen</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bulkData.slice(0, 10).map((row, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{i + 1}</Table.Td>
                    <Table.Td>{row.phone}</Table.Td>
                    <Table.Td>{row.message}</Table.Td>
                    <Table.Td>
                      {row.image ? (
                        row.image.startsWith("http") ||
                        row.image.startsWith("data:") ? (
                          <img
                            src={row.image}
                            alt="preview"
                            style={{
                              width: 44,
                              height: 44,
                              objectFit: "cover",
                              borderRadius: 6,
                              boxShadow: "0 0 2px #888",
                            }}
                          />
                        ) : (
                          <Text size="xs" c="dimmed">
                            base64
                          </Text>
                        )
                      ) : (
                        "-"
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Button
              color="green"
              fullWidth
              loading={bulkSending}
              onClick={handleSendBulk}
              disabled={bulkSending}
              mt="md"
            >
              Enviar Masivo
            </Button>
            {bulkSending && (
              <Progress value={bulkProgress} size="md" animated mt={8} />
            )}
          </>
        )}

        {/* Reporte */}
        {report.length > 0 && (
          <>
            <Text mt="md" fw={500}>
              Informe de envío
            </Text>
            <Table striped highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Teléfono</Table.Th>
                  <Table.Th>Mensaje</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Error</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {report.map((row, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{i + 1}</Table.Td>
                    <Table.Td>{row.phone}</Table.Td>
                    <Table.Td>{row.message}</Table.Td>
                    <Table.Td
                      style={{
                        color: row.status === "Enviado" ? "green" : "red",
                      }}
                    >
                      {row.status}
                    </Table.Td>
                    <Table.Td>{row.error || "-"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        )}
      </Stack>
    </Paper>
  );
}
