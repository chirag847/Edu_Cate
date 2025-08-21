import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

interface ThemeContextType {
  isDarkMode: boolean;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode] = useState(true); // Always dark mode

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#065a60',
        light: '#0b525b',
        dark: '#144552',
      },
      secondary: {
        main: '#312244',
        light: '#3e1f47',
        dark: '#4d194d',
      },
      background: {
        default: '#1a1a1a',
        paper: '#242424',
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
      },
      success: {
        main: '#006466',
      },
      warning: {
        main: '#065a60',
      },
      info: {
        main: '#0b525b',
      },
      error: {
        main: '#4d194d',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        marginBottom: '1.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
        marginBottom: '1.25rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.4,
        marginBottom: '1rem',
      },
      h4: {
        fontWeight: 500,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        marginBottom: '0.75rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.4,
        marginBottom: '0.5rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.1rem',
        lineHeight: 1.4,
        marginBottom: '0.5rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        marginBottom: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        marginBottom: '0.75rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '12px',
            padding: '10px 24px',
            fontSize: '0.95rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(203, 153, 126, 0.3)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #065a60 0%, #006466 100%)',
            color: '#f1f5f9',
          },
          outlined: {
            borderColor: '#065a60',
            color: '#065a60',
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
              backgroundColor: 'rgba(6, 90, 96, 0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            padding: '24px',
            margin: '16px 0',
            background: 'linear-gradient(135deg, #242424 0%, #1a1a1a 100%)',
            border: '1px solid #374151',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid rgba(6, 90, 96, 0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: '#242424',
            borderRadius: '12px',
            padding: '16px',
            margin: '8px 0',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            margin: '12px 0',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: '#374151',
                borderWidth: '2px',
              },
              '&:hover fieldset': {
                borderColor: '#4b5563',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#065a60',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#065a60',
              fontWeight: 500,
            },
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '32px',
            paddingBottom: '32px',
            '@media (max-width: 600px)': {
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '24px',
              paddingBottom: '24px',
            },
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            padding: '0 24px',
            minHeight: '72px',
            '@media (max-width: 600px)': {
              padding: '0 16px',
              minHeight: '64px',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '20px',
            margin: '4px',
            fontWeight: 500,
            backgroundColor: '#0b525b',
            color: '#f1f5f9',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
