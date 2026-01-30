import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store';
import { Loader2 } from 'lucide-react';

export const AuthSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { checkAuth, user } = useAuth();

    useEffect(() => {
        const finalizeLogin = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.error('Failed to finalize login:', error);
                navigate('/');
            }
        };

        finalizeLogin();
    }, [checkAuth, navigate]);

    useEffect(() => {
        if (user) {
            // Redirect to profile or home once user is loaded
            navigate('/profile');
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-black animate-spin mx-auto" />
                <h1 className="text-2xl font-bold tracking-tight">Authenticating...</h1>
                <p className="text-neutral-500">Please wait while we complete your login.</p>
            </div>
        </div>
    );
};
