import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        VANTA: any;
        THREE: any;
    }
}

interface VantaBackgroundProps {
    children?: React.ReactNode;
    className?: string;
}

// Vanta.js NET effect - creates a beautiful animated neural network background
const VantaBackground: React.FC<VantaBackgroundProps> = ({ children, className = '' }) => {
    const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffectRef = useRef<any>(null);

    useEffect(() => {
        // Load THREE.js first, then VANTA
        const loadScripts = async () => {
            // Check if already loaded
            if (window.VANTA && window.THREE) {
                initVanta();
                return;
            }

            // Load THREE.js
            if (!window.THREE) {
                await new Promise<void>((resolve) => {
                    const threeScript = document.createElement('script');
                    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
                    threeScript.onload = () => resolve();
                    document.head.appendChild(threeScript);
                });
            }

            // Load VANTA NET
            if (!window.VANTA) {
                await new Promise<void>((resolve) => {
                    const vantaScript = document.createElement('script');
                    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
                    vantaScript.onload = () => resolve();
                    document.head.appendChild(vantaScript);
                });
            }

            initVanta();
        };

        const initVanta = () => {
            if (vantaRef.current && window.VANTA && !vantaEffectRef.current) {
                vantaEffectRef.current = window.VANTA.NET({
                    el: vantaRef.current,
                    THREE: window.THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    color: 0xc0c0c0,           // Light gray lines
                    backgroundColor: 0xf0f0f0, // Light background (rgb 240,240,240)
                    points: 12.00,
                    maxDistance: 22.00,
                    spacing: 18.00,
                    showDots: true
                });
            }
        };

        loadScripts();

        return () => {
            if (vantaEffectRef.current) {
                vantaEffectRef.current.destroy();
                vantaEffectRef.current = null;
            }
        };
    }, []);

    return (
        <div ref={vantaRef} className={`relative ${className}`}>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default VantaBackground;
