// FILE: components/Confetti.js
// Deskripsi: Komponen untuk animasi konfeti di halaman ucapan.
import { useEffect } from 'react';

export default function Confetti() {
    useEffect(() => {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let confettiPieces = [];
        const colors = ['#f9a8d4', '#a78bfa', '#60a5fa', '#fde047', '#6ee7b7'];

        function ConfettiPiece(x, y) {
            this.x = x; this.y = y;
            this.size = Math.random() * 8 + 4;
            this.vx = Math.random() * 4 - 2;
            this.vy = Math.random() * 5 + 2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.angle = Math.random() * Math.PI * 2;
            this.rotation = Math.random() * 0.1 - 0.05;
        }
        ConfettiPiece.prototype.update = function() {
            this.x += this.vx; this.y += this.vy; this.angle += this.rotation;
            if (this.y > canvas.height) {
                this.y = -this.size; this.x = Math.random() * canvas.width;
            }
        };
        ConfettiPiece.prototype.draw = function() {
            ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        };
        function createConfetti() {
            for (let i = 0; i < 150; i++) {
                confettiPieces.push(new ConfettiPiece(Math.random() * canvas.width, -Math.random() * canvas.height));
            }
        }
        let animationFrameId;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confettiPieces.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animate);
        }
        createConfetti(); animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return <canvas id="confetti-canvas" className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"></canvas>;
};

