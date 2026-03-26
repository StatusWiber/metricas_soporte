import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DetalleOperador from './pages/DetalleOperador';
import Alertas from './pages/Alertas';

/**
 * Main App Component with Routing
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/operador/:operador_id" element={<DetalleOperador />} />
      <Route path="/alertas" element={<Alertas />} />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">404</h1>
              <p className="text-gray-400 mb-6">Página no encontrada</p>
              <a href="/" className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors">
                Volver al Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
