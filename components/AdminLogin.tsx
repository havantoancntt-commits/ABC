import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const ADMIN_PASSWORD = 'huyenphongphatdao2025';

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const { t } = useLocalization();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(null);
      sessionStorage.setItem('admin_auth', 'true');
      onSuccess();
    } else {
      setError(t('passwordIncorrect'));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif text-yellow-300 leading-tight">
              {t('adminLoginTitle')}
            </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
            className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${error ? 'border-red-500' : 'border-gray-600'}`}
            placeholder={t('passwordPlaceholder')}
            required
            aria-invalid={!!error}
            aria-describedby={error ? "password-error" : undefined}
          />
          {error && <p id="password-error" className="text-red-500 text-xs mt-2 text-center">{error}</p>}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={onBack} variant="secondary" type="button">{t('back')}</Button>
            <Button type="submit" variant="primary">{t('passwordSubmit')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
