import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SparksApp from './ui/SparksApp';
import './styles/sparks.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SparksApp />
  </StrictMode>
);
