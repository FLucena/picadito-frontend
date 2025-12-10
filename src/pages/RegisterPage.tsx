import { useState } from 'react';
import { authApi } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from '../utils/toast';
import { logger } from '../utils/logger';
import { setTokens, setUserInfo, setRememberMe } from '../utils/storage';
import { UserPlus } from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: (userData: { email: string; nombre: string; rol: string; usuarioId?: number }) => void;
  onBackToLogin: () => void;
}

export const RegisterPage = ({ onRegisterSuccess, onBackToLogin }: RegisterPageProps) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMeState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (): string | null => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/[a-z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre || !email || !password || !confirmPassword) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({ nombre, email, password });
      
      // Set remember me preference before storing tokens
      setRememberMe(rememberMe);
      
      // Almacenar tokens usando utilidad de storage
      setTokens(response.token, response.refreshToken);
      
      // Almacenar información del usuario
      setUserInfo(response.email, response.nombre, response.rol);
      
      toast.success(`¡Bienvenido, ${response.nombre}! Tu cuenta ha sido creada exitosamente.`);
      
      // Notificar al componente padre
      onRegisterSuccess({
        email: response.email,
        nombre: response.nombre,
        rol: response.rol,
      });
    } catch (error: any) {
      logger.error('Error en registro:', error);
      toast.error(error.message || 'Error al registrarse. Por favor, intenta nuevamente.');
      // Limpiar campos de contraseña después de error
      setPassword('');
      setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Regístrate para comenzar a usar Picadito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Tu nombre completo"
              required
              disabled={isLoading}
              minLength={2}
              maxLength={100}
            />
          </div>

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
              minLength={8}
              autoComplete="new-password"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 8 caracteres, con mayúscula, minúscula y número
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="••••••••"
              required
              disabled={isLoading}
              autoComplete="new-password"
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
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Ya tienes una cuenta?</p>
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-primary-600 hover:text-primary-700 font-medium mt-1"
            disabled={isLoading}
          >
            Inicia sesión aquí
          </button>
        </div>
      </Card>
    </div>
  );
};

