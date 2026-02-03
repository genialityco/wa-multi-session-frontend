import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 700,
  },
  components: {
    Button: {
      defaultProps: {
        fw: 600,
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
      },
    },
  },
});
