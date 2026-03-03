import React, { useState } from 'react';
import { useAuth } from '../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Input, Alert } from '../components/UI';

export const Profile = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSave = async () => {
        if (!newName.trim()) {
            setError('Имя не может быть пустым');
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await updateProfile({ name: newName.trim() });
            setIsEditing(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка при сохранении профиля');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewName(user?.name || '');
        setError(null);
    };

    if (!user) return <Navigate to="/" />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-display font-extrabold uppercase mb-8 text-center">Мой профиль</h1>

            <div className="flex justify-center">
                {/* User Info Card */}
                <div className="w-full max-w-md">
                    <div className="bg-white border rounded-2xl p-6 text-center">
                        <img
                            src={user.picture_url}
                            referrerPolicy="no-referrer"
                            className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-gray-50 hover:border-gray-200 transition-colors duration-300"
                            alt="Аватар профиля"
                        />

                        {isEditing ? (
                            <div className="mb-2 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {error && <Alert type="error" title="Ошибка" message={error} />}
                                <div className="mb-6">
                                    <Input
                                        label="Отображаемое имя"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        disabled={isSaving}
                                        autoFocus
                                        placeholder="Например, Александр"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mb-6 text-center leading-relaxed">
                                    Изменение фотографии профиля пока недоступно.
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving || newName.trim() === user.name || !newName.trim()}
                                        fullWidth
                                    >
                                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        fullWidth
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                                <p className="text-gray-500 mb-8">{user.email}</p>
                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                        fullWidth
                                    >
                                        Редактировать профиль
                                    </Button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors duration-200"
                                    >
                                        Выйти из аккаунта
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};