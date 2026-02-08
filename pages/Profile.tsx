import React from 'react';
import { useAuth } from '../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';

export const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return <Navigate to="/" />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-display font-extrabold uppercase mb-8 text-center">Мой профиль</h1>

            <div className="flex justify-center">
                {/* User Info Card */}
                <div className="w-full max-w-md">
                    <div className="bg-white border rounded-2xl p-6 text-center">
                        <img src={user.picture_url} referrerPolicy="no-referrer" className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-gray-50" />
                        <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                        <p className="text-gray-500 mb-8">{user.email}</p>
                        <div className="space-y-3">
                            <Button variant="outline" fullWidth>Редактировать профиль</Button>
                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl transition"
                            >
                                Выйти из аккаунта
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};