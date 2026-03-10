import { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Text, ThemeIcon, rem, Box, useMantineColorScheme, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandWhatsapp, IconMessage, IconUsers, IconMoon, IconSun, IconSettings } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const data = [
    { icon: IconBrandWhatsapp, label: 'Sesiones', to: '/' },
    { icon: IconMessage, label: 'Mensajería', to: '/messages' },
    { icon: IconSettings, label: 'Cuentas', to: '/accounts' },
    // { icon: IconUsers, label: 'Contactos', to: '/contacts' }, // Future feature
  ];

  const items = data.map((item) => (
    <NavLink
      key={item.label}
      active={location.pathname === item.to}
      label={item.label}
      leftSection={<item.icon size="1.2rem" stroke={1.5} />}
      onClick={() => {
        navigate(item.to);
        if (opened) toggle();
      }}
      variant="light"
      color="teal"
      style={{ borderRadius: '8px', marginBottom: '4px' }}
    />
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
            <Group>
                <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                <Group gap="xs">
                    <ThemeIcon variant="gradient" gradient={{ from: 'teal', to: 'lime', deg: 105 }} size="lg" radius="md">
                        <IconBrandWhatsapp style={{ width: rem(20), height: rem(20) }} />
                    </ThemeIcon>
                    <Text fw={700} fz="xl" variant="gradient" gradient={{ from: 'teal', to: 'lime', deg: 105 }}>
                        Geniality WA
                    </Text>
                </Group>
            </Group>
            <ActionIcon onClick={() => toggleColorScheme()} variant="default" size="lg" radius="md">
              {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoon size="1.2rem" />}
            </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box style={{ flex: 1 }}>
            <Text size="xs" fw={500} c="dimmed" mb="sm" tt="uppercase">Menu</Text>
            {items}
        </Box>
        <Box style={{ borderTop: '1px solid var(--mantine-color-default-border)', paddingTop: '1rem' }}>
             <Text size="xs" c="dimmed" ta="center">© 2024 Geniality</Text>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
