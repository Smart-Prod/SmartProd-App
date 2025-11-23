import React from 'react';
import ReactDOM from 'react-dom/client';
import "./styles/globals.css";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext"; // Importado e Usado
import { QueryClientProvider } from '@tanstack/react-query'; // Importar
import { queryClient } from './lib/react-query'; // Importar o cliente

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* O QueryClientProvider deve ser o primeiro se for usado por outros contexts */}
    <QueryClientProvider client={queryClient}> 
      {/* AuthProvider deve vir antes, pois AppProvider pode depender do estado de Auth */}
      <AuthProvider>
        {/* AppProvider deve envolver App para que componentes internos usem useApp() */}
        <AppProvider> 
          <App />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);