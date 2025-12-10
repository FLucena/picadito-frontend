import { useState } from 'react';
import { authApi } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from '../utils/toast';
import { logger } from '../utils/logger';
import { setTokens, setUserInfo, setRememberMe } from '../utils/storage';
import { LogIn } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userData: { email: string; nombre: string; rol: string; usuarioId?: number }) => void;
  onShowRegister?: () => void;
}

export const LoginPage = ({ onLoginSuccess, onShowRegister }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMeState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      // Set remember me preference before storing tokens
      setRememberMe(rememberMe);
      
      // Almacenar tokens usando utilidad de storage
      setTokens(response.token, response.refreshToken);
      
      // Almacenar información del usuario
      setUserInfo(response.email, response.nombre, response.rol);
      
      toast.success(`Bienvenido, ${response.nombre}!`);
      
      // Notificar al componente padre
      onLoginSuccess({
        email: response.email,
        nombre: response.nombre,
        rol: response.rol,
      });
    } catch (error: any) {
      logger.error('Error en login:', error);
      // Mensaje genérico para evitar timing attacks
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
      // Limpiar campos de contraseña después de error
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
          <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="••••••••"
              required
              disabled={isLoading}
              autoComplete="current-password"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMeState(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Recordarme
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿No tienes una cuenta?</p>
          <button
            type="button"
            onClick={() => {
              if (onShowRegister) {
                onShowRegister();
              }
            }}
            className="text-primary-600 hover:text-primary-700 font-medium mt-1"
            disabled={isLoading}
          >
            Regístrate aquí
          </button>
        </div>
      </Card>
    </div>
  );
};

