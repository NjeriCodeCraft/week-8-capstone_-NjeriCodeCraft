import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(true).toBe(true);
  });
}); 