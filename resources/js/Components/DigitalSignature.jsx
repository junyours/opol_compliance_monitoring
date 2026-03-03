import React, { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function DigitalSignature({ signature, auth }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    const { data, setData, post, processing } = useForm({
        signature: signature?.signature || '',
        signature_type: 'drawn',
    });

    // Signature drawing functions
    const setupCanvas = (canvasRef) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };

    const startDrawing = (e, canvasRef, setIsDrawing) => {
        e.preventDefault();
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        
        // Handle both mouse and touch events
        const rect = canvas.getBoundingClientRect();
        let x, y;
        
        if (e.type === 'mousedown') {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        } else if (e.type === 'touchstart') {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        }
        
        ctx.moveTo(x, y);
    };

    const draw = (e, canvasRef, isDrawing) => {
        if (!isDrawing) return;
        
        if (e.type === 'touchmove') {
            e.preventDefault();
        }
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        let x, y;
        
        if (e.type === 'mousemove') {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        } else if (e.type === 'touchmove') {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        }
        
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = (e, canvasRef, isDrawingState, setSignature, setIsDrawing) => {
        if (!isDrawingState) return;
        
        if (e.type === 'touchend') {
            e.preventDefault();
        }
        
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Save signature as data URL
        const signatureData = canvas.toDataURL();
        setSignature(signatureData);
    };

    const clearSignature = (canvasRef, setSignature) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature('');
    };

    const generateSignature = (canvasRef, setSignature) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Get current drawing data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Clear canvas for regenerated signature
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply signature enhancement
        ctx.save();
        
        // Set signature style
        ctx.strokeStyle = '#000080'; // Dark blue ink color
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.9;
        
        // Add subtle shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Redraw signature with enhanced style
        ctx.putImageData(imageData, 0, 0);
        
        // Apply smoothing effect
        const smoothedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = smoothedData.data;
        
        // Simple smoothing algorithm
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // If pixel has alpha (is drawn)
                // Enhance stroke
                data[i] = Math.min(255, data[i] * 1.1);     // R
                data[i + 1] = Math.min(255, data[i + 1] * 1.1); // G  
                data[i + 2] = Math.min(255, data[i + 2] * 1.2); // B (more blue)
            }
        }
        
        ctx.putImageData(smoothedData, 0, 0);
        ctx.restore();
        
        // Add timestamp and signature style
        ctx.save();
        ctx.font = 'italic 10px Arial';
        ctx.fillStyle = '#666';
        ctx.globalAlpha = 0.5;
        
        // Add small signature indicator
        const date = new Date().toLocaleDateString();
        ctx.fillText('Digitally Signed: ' + date, 5, canvas.height - 5);
        ctx.restore();
        
        // Save enhanced signature
        const signatureData = canvas.toDataURL('image/png');
        setSignature(signatureData);
    };

    useEffect(() => {
        if (signature?.signature && signature.signature_type === 'drawn') {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = signature.signature;
        }
    }, [signature]);

    // Setup canvas when component mounts
    useEffect(() => {
        if (canvasRef.current) {
            setupCanvas(canvasRef);
        }
    }, []);

    const saveSignature = (e) => {
        e.preventDefault();
        
        const canvas = canvasRef.current;
        const signatureData = canvas.toDataURL();
        setData('signature', signatureData);
        
        post(route('staff.profile.signature.save'));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Digital Signature</h3>
                
                {/* DRAW SECTION */}
                <div className="space-y-4">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-48 border border-gray-200 rounded cursor-crosshair touch-none"
                        onMouseDown={(e) => startDrawing(e, canvasRef, setIsDrawing)}
                        onMouseMove={(e) => draw(e, canvasRef, isDrawing)}
                        onMouseUp={(e) => stopDrawing(e, canvasRef, isDrawing, setData, setIsDrawing)}
                        onMouseLeave={(e) => stopDrawing(e, canvasRef, isDrawing, setData, setIsDrawing)}
                        onTouchStart={(e) => startDrawing(e, canvasRef, setIsDrawing)}
                        onTouchMove={(e) => draw(e, canvasRef, isDrawing)}
                        onTouchEnd={(e) => stopDrawing(e, canvasRef, isDrawing, setData, setIsDrawing)}
                    />
                    <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Draw your signature above</span>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => generateSignature(canvasRef, setData)}
                                className="text-xs text-green-600 hover:text-green-800"
                            >
                                Generate
                            </button>
                            <button
                                type="button"
                                onClick={() => clearSignature(canvasRef, setData)}
                                className="text-xs text-red-600 hover:text-red-800"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        onClick={saveSignature}
                        disabled={processing}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl"
                    >
                        {processing ? 'Saving...' : 'Save Signature'}
                    </button>
                </div>
            </div>
        </div>
    );
}