import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/game");
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${Math.random() * 10 + 10}s`
    }));
    setParticles(newParticles);
  }, []);

  if (isLoading) return null;

  return (
    <div className="menu-container">
      <style>{`
        .menu-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #1a1410;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .dungeon-background {
          position: absolute;
          width: 100%;
          height: 100%;
          background: 
            linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.8) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%),
            repeating-linear-gradient(0deg, #2a2420 0px, #352d28 3px, #2a2420 6px),
            repeating-linear-gradient(90deg, #2a2420 0px, #3d3530 5px, #2a2420 10px);
          background-blend-mode: normal;
        }

        .stone-texture {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(60, 50, 45, 0.3) 0%, transparent 3%),
            radial-gradient(circle at 80% 20%, rgba(50, 40, 35, 0.3) 0%, transparent 2%),
            radial-gradient(circle at 40% 70%, rgba(55, 45, 40, 0.3) 0%, transparent 2.5%),
            radial-gradient(circle at 90% 60%, rgba(45, 35, 30, 0.3) 0%, transparent 3%),
            radial-gradient(circle at 15% 80%, rgba(50, 40, 35, 0.3) 0%, transparent 2%),
            radial-gradient(circle at 60% 40%, rgba(55, 45, 40, 0.3) 0%, transparent 3.5%),
            radial-gradient(circle at 70% 85%, rgba(48, 38, 33, 0.3) 0%, transparent 2%),
            radial-gradient(circle at 30% 50%, rgba(52, 42, 37, 0.3) 0%, transparent 3%);
          opacity: 0.8;
        }

        .archway {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .archway::before {
          content: '';
          position: absolute;
          width: min(900px, 90vw);
          height: 95%;
          border: 40px solid #1a1410;
          border-bottom: none;
          border-radius: 450px 450px 0 0;
          box-shadow: 
            inset 0 0 60px rgba(0, 0, 0, 0.9),
            inset 0 20px 40px rgba(0, 0, 0, 0.7),
            0 0 100px rgba(0, 0, 0, 0.8);
          background: linear-gradient(180deg, 
            rgba(26, 20, 16, 0.3) 0%, 
            rgba(26, 20, 16, 0.5) 50%, 
            rgba(26, 20, 16, 0.8) 100%);
        }

        .archway::after {
          content: '';
          position: absolute;
          width: min(900px, 90vw);
          height: 95%;
          border-radius: 450px 450px 0 0;
          background-image: 
            repeating-linear-gradient(90deg, 
              transparent 0px, 
              transparent 80px, 
              rgba(0, 0, 0, 0.3) 80px, 
              rgba(0, 0, 0, 0.3) 82px),
            repeating-linear-gradient(0deg, 
              transparent 0px, 
              transparent 60px, 
              rgba(0, 0, 0, 0.3) 60px, 
              rgba(0, 0, 0, 0.3) 62px);
          pointer-events: none;
        }

        .wall-left, .wall-right {
          position: absolute;
          width: 200px;
          height: 100%;
          background: 
            repeating-linear-gradient(0deg, 
              #3d3530 0px, 
              #3d3530 80px, 
              #2a2420 80px, 
              #2a2420 85px),
            repeating-linear-gradient(90deg, 
              #352d28 0px, 
              #352d28 100px, 
              #2a2420 100px, 
              #2a2420 105px);
          box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.8);
        }

        .wall-left {
          left: 0;
          background-position: 0 0, 0 40px;
        }

        .wall-right {
          right: 0;
          background-position: 0 0, 50px 40px;
        }

        .dungeon-floor {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 150px;
          background: 
            linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.8) 100%),
            repeating-linear-gradient(90deg, 
              #2a2420 0px, 
              #2a2420 120px, 
              #1a1410 120px, 
              #1a1410 125px);
          box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.8);
        }

        .moss-overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(ellipse at 10% 30%, rgba(40, 60, 40, 0.1) 0%, transparent 20%),
            radial-gradient(ellipse at 90% 40%, rgba(35, 55, 35, 0.1) 0%, transparent 15%),
            radial-gradient(ellipse at 30% 80%, rgba(45, 65, 45, 0.1) 0%, transparent 18%),
            radial-gradient(ellipse at 70% 20%, rgba(38, 58, 38, 0.1) 0%, transparent 12%);
          opacity: 0.6;
        }

        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(139, 92, 246, 0.5);
          border-radius: 50%;
          animation: float 15s infinite ease-in-out;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        .glow-orb {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.2;
          animation: pulse 8s infinite alternate;
        }

        .glow-orb-1 {
          background: radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, transparent 70%);
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
        }

        .glow-orb-2 {
          background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
          bottom: -200px;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: -4s;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }

        .scanline {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(139, 92, 246, 0.02) 51%
          );
          background-size: 100% 4px;
          pointer-events: none;
          animation: scan 8s linear infinite;
        }

        @keyframes scan {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100%;
          }
        }

        .corner-decor {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 2px solid rgba(139, 92, 246, 0.2);
        }

        .corner-tl {
          top: 40px;
          left: 40px;
          border-right: none;
          border-bottom: none;
        }

        .corner-tr {
          top: 40px;
          right: 40px;
          border-left: none;
          border-bottom: none;
        }

        .corner-bl {
          bottom: 40px;
          left: 40px;
          border-right: none;
          border-top: none;
        }

        .corner-br {
          bottom: 40px;
          right: 40px;
          border-left: none;
          border-top: none;
        }

        .menu-content {
          text-align: center;
          z-index: 10;
          animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .title-container {
          margin-bottom: 60px;
          position: relative;
        }

        .title-main {
          font-size: clamp(60px, 12vw, 140px);
          font-weight: 900;
          letter-spacing: 15px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.5));
          animation: titleGlow 3s ease-in-out infinite;
          margin-bottom: 10px;
        }

        @keyframes titleGlow {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 50px rgba(251, 191, 36, 0.8));
          }
        }

        .subtitle {
          font-size: clamp(16px, 3vw, 24px);
          letter-spacing: 8px;
          color: rgba(139, 92, 246, 0.9);
          text-transform: uppercase;
          font-weight: 300;
          margin-bottom: 40px;
        }

        .tagline {
          font-size: clamp(14px, 2vw, 18px);
          color: rgba(255, 255, 255, 0.7);
          font-weight: 300;
          letter-spacing: 2px;
          margin-bottom: 50px;
          font-style: italic;
        }

        .features {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 50px;
          flex-wrap: wrap;
          padding: 0 20px;
        }

        .feature-badge {
          padding: 14px 28px;
          background: rgba(139, 92, 246, 0.1);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 30px;
          color: rgba(139, 92, 246, 1);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          cursor: default;
          backdrop-filter: blur(10px);
        }

        .feature-badge:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .feature-icon {
          font-size: 18px;
        }

        .cta-button {
          padding: 22px 80px;
          font-size: clamp(16px, 2.5vw, 22px);
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #000;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 40px rgba(245, 158, 11, 0.4);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: inline-block;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 50px rgba(245, 158, 11, 0.6);
        }

        .cta-button:active {
          transform: translateY(-1px);
        }

        /* Goblin Animation */
        .goblin-scene {
          position: absolute;
          bottom: 180px;
          left: -150px;
          font-size: 60px;
          animation: goblin-walk 25s linear infinite;
          z-index: 5;
          filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.5));
        }

        @keyframes goblin-walk {
          0% { left: -150px; }
          100% { left: calc(100% + 150px); }
        }

        .goblin {
          display: inline-block;
          animation: goblin-bounce 0.5s infinite ease-in-out;
          position: relative;
          width: 50px;
          height: 60px;
        }

        @keyframes goblin-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .goblin-head {
          position: absolute;
          width: 35px;
          height: 35px;
          background: #5a7a3a;
          border-radius: 50% 50% 45% 45%;
          top: 0;
          left: 8px;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.3);
        }

        .goblin-ear-left, .goblin-ear-right {
          position: absolute;
          width: 15px;
          height: 20px;
          background: #5a7a3a;
          border-radius: 50%;
          top: 8px;
        }

        .goblin-ear-left { left: -8px; transform: rotate(-20deg); }
        .goblin-ear-right { right: -8px; transform: rotate(20deg); }

        .goblin-eye-left, .goblin-eye-right {
          position: absolute;
          width: 8px;
          height: 10px;
          background: #ffff00;
          border-radius: 50%;
          top: 12px;
          box-shadow: 0 0 5px rgba(255, 255, 0, 0.5);
        }

        .goblin-eye-left { left: 8px; }
        .goblin-eye-right { right: 8px; }

        .goblin-body {
          position: absolute;
          width: 30px;
          height: 25px;
          background: #6a5a4a;
          border-radius: 40% 40% 50% 50%;
          top: 30px;
          left: 10px;
        }

        .goblin-arm-left, .goblin-arm-right {
          position: absolute;
          width: 8px;
          height: 20px;
          background: #5a7a3a;
          border-radius: 50%;
          top: 32px;
        }

        .goblin-arm-left {
          left: 5px;
          transform: rotate(-30deg);
          animation: arm-swing-left 0.5s infinite ease-in-out;
        }

        .goblin-arm-right {
          right: 5px;
          transform: rotate(30deg);
          animation: arm-swing-right 0.5s infinite ease-in-out;
        }

        @keyframes arm-swing-left {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(-45deg); }
        }

        @keyframes arm-swing-right {
          0%, 100% { transform: rotate(30deg); }
          50% { transform: rotate(15deg); }
        }

        .goblin-leg-left, .goblin-leg-right {
          position: absolute;
          width: 8px;
          height: 15px;
          background: #5a7a3a;
          border-radius: 30%;
          top: 52px;
        }

        .goblin-leg-left {
          left: 12px;
          animation: leg-walk-left 0.5s infinite ease-in-out;
        }

        .goblin-leg-right {
          right: 12px;
          animation: leg-walk-right 0.5s infinite ease-in-out;
        }

        @keyframes leg-walk-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }

        @keyframes leg-walk-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }

        /* Skeleton Animation */
        .skeleton-scene {
          position: absolute;
          top: 200px;
          right: -150px;
          animation: skeleton-walk 30s linear infinite;
          animation-delay: -10s;
          z-index: 5;
          filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.5));
        }

        @keyframes skeleton-walk {
          0% { right: -150px; }
          100% { right: calc(100% + 150px); }
        }

        .skeleton {
          display: inline-block;
          animation: skeleton-bounce 0.6s infinite ease-in-out;
          position: relative;
          width: 50px;
          height: 60px;
          transform: scaleX(-1);
        }

        @keyframes skeleton-bounce {
          0%, 100% { transform: scaleX(-1) translateY(0); }
          50% { transform: scaleX(-1) translateY(-6px); }
        }

        .skeleton-head {
          position: absolute;
          width: 28px;
          height: 28px;
          background: #e8e8d8;
          border-radius: 50%;
          top: 0;
          left: 11px;
          box-shadow: inset -4px -4px 8px rgba(0, 0, 0, 0.2);
        }

        .skeleton-eye-left, .skeleton-eye-right {
          position: absolute;
          width: 6px;
          height: 8px;
          background: #000;
          border-radius: 50%;
          top: 10px;
        }

        .skeleton-eye-left { left: 5px; }
        .skeleton-eye-right { right: 5px; }

        .skeleton-body {
          position: absolute;
          width: 20px;
          height: 22px;
          background: #d8d8c8;
          border-radius: 20%;
          top: 26px;
          left: 15px;
        }

        .skeleton-arm-left, .skeleton-arm-right {
          position: absolute;
          width: 6px;
          height: 20px;
          background: #e8e8d8;
          border-radius: 50%;
          top: 28px;
        }

        .skeleton-arm-left { left: 8px; animation: skel-arm-left 0.6s infinite ease-in-out; }
        .skeleton-arm-right { right: 8px; animation: skel-arm-right 0.6s infinite ease-in-out; }

        @keyframes skel-arm-left {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(-35deg); }
        }

        @keyframes skel-arm-right {
          0%, 100% { transform: rotate(20deg); }
          50% { transform: rotate(5deg); }
        }

        .skeleton-leg-left, .skeleton-leg-right {
          position: absolute;
          width: 6px;
          height: 16px;
          background: #e8e8d8;
          border-radius: 30%;
          top: 46px;
        }

        .skeleton-leg-left { left: 15px; animation: skel-leg-left 0.6s infinite ease-in-out; }
        .skeleton-leg-right { right: 15px; animation: skel-leg-right 0.6s infinite ease-in-out; }

        @keyframes skel-leg-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }

        @keyframes skel-leg-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }

        /* Orc Animation */
        .orc-scene {
          position: absolute;
          bottom: 200px;
          left: -180px;
          animation: orc-march 35s linear infinite;
          animation-delay: -5s;
          z-index: 5;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6));
        }

        @keyframes orc-march {
          0% { left: -180px; }
          100% { left: calc(100% + 180px); }
        }

        .orc {
          display: inline-block;
          animation: orc-bounce 0.7s infinite ease-in-out;
          position: relative;
          width: 65px;
          height: 85px;
        }

        @keyframes orc-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .orc-head {
          position: absolute;
          width: 45px;
          height: 42px;
          background: #3d5a3d;
          border-radius: 50% 50% 45% 45%;
          top: 0;
          left: 10px;
          box-shadow: inset -6px -6px 12px rgba(0, 0, 0, 0.4);
        }

        .orc-eye-left, .orc-eye-right {
          position: absolute;
          width: 10px;
          height: 12px;
          background: #ff0000;
          border-radius: 50%;
          top: 14px;
          box-shadow: 0 0 6px rgba(255, 0, 0, 0.6);
        }

        .orc-eye-left { left: 10px; }
        .orc-eye-right { right: 10px; }

        .orc-body {
          position: absolute;
          width: 45px;
          height: 32px;
          background: #4a3a2a;
          border-radius: 40% 40% 50% 50%;
          top: 35px;
          left: 10px;
        }

        .orc-arm-left, .orc-arm-right {
          position: absolute;
          width: 12px;
          height: 28px;
          background: #3d5a3d;
          border-radius: 50%;
          top: 38px;
        }

        .orc-arm-left { left: 0; animation: orc-arm-left 0.7s infinite ease-in-out; }
        .orc-arm-right { right: 0; animation: orc-arm-right 0.7s infinite ease-in-out; }

        @keyframes orc-arm-left {
          0%, 100% { transform: rotate(-25deg); }
          50% { transform: rotate(-40deg); }
        }

        @keyframes orc-arm-right {
          0%, 100% { transform: rotate(25deg); }
          50% { transform: rotate(10deg); }
        }

        .orc-leg-left, .orc-leg-right {
          position: absolute;
          width: 12px;
          height: 20px;
          background: #3d5a3d;
          border-radius: 30%;
          top: 64px;
        }

        .orc-leg-left { left: 15px; animation: orc-leg-left 0.7s infinite ease-in-out; }
        .orc-leg-right { right: 15px; animation: orc-leg-right 0.7s infinite ease-in-out; }

        @keyframes orc-leg-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }

        @keyframes orc-leg-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }

        /* Knight Animation */
        .knight-scene {
          position: absolute;
          top: 150px;
          right: -200px;
          animation: knight-march 40s linear infinite;
          animation-delay: -20s;
          z-index: 5;
          filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.7));
        }

        @keyframes knight-march {
          0% { right: -200px; }
          100% { right: calc(100% + 200px); }
        }

        .knight {
          display: inline-block;
          animation: knight-bounce 0.8s infinite ease-in-out;
          position: relative;
          width: 70px;
          height: 85px;
          transform: scaleX(-1);
        }

        @keyframes knight-bounce {
          0%, 100% { transform: scaleX(-1) translateY(0); }
          50% { transform: scaleX(-1) translateY(-8px); }
        }

        .knight-helmet {
          position: absolute;
          width: 40px;
          height: 38px;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
          border-radius: 50% 50% 45% 45%;
          top: 0;
          left: 15px;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.8);
          border: 2px solid #0a0a0a;
        }

        .knight-visor {
          position: absolute;
          width: 28px;
          height: 3px;
          background: #000;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
        }

        .knight-body {
          position: absolute;
          width: 48px;
          height: 38px;
          background: linear-gradient(135deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%);
          border-radius: 35% 35% 50% 50%;
          top: 35px;
          left: 11px;
          border: 2px solid #1a1a1a;
        }

        .knight-arm-left, .knight-arm-right {
          position: absolute;
          width: 12px;
          height: 32px;
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
          border-radius: 50%;
          top: 38px;
          border: 1px solid #0a0a0a;
        }

        .knight-arm-left { left: 2px; animation: knight-arm-left 0.8s infinite ease-in-out; }
        .knight-arm-right { right: 2px; animation: knight-arm-right 0.8s infinite ease-in-out; }

        @keyframes knight-arm-left {
          0%, 100% { transform: rotate(30deg); }
          50% { transform: rotate(15deg); }
        }

        @keyframes knight-arm-right {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(-15deg); }
        }

        .knight-leg-left, .knight-leg-right {
          position: absolute;
          width: 12px;
          height: 22px;
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
          border-radius: 30%;
          top: 70px;
          border: 1px solid #0a0a0a;
        }

        .knight-leg-left { left: 18px; animation: knight-leg-left 0.8s infinite ease-in-out; }
        .knight-leg-right { right: 18px; animation: knight-leg-right 0.8s infinite ease-in-out; }

        @keyframes knight-leg-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }

        @keyframes knight-leg-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }

        @media (max-width: 768px) {
          .features {
            flex-direction: column;
            align-items: center;
          }

          .cta-button {
            padding: 18px 60px;
          }

          .corner-decor {
            display: none;
          }
        }
      `}</style>

      <div className="dungeon-background" />
      <div className="stone-texture" />
      <div className="archway" />
      <div className="wall-left" />
      <div className="wall-right" />
      <div className="dungeon-floor" />
      <div className="moss-overlay" />

      {/* Animated monsters */}
      <div className="goblin-scene">
        <div className="goblin">
          <div className="goblin-head">
            <div className="goblin-ear-left" />
            <div className="goblin-ear-right" />
            <div className="goblin-eye-left" />
            <div className="goblin-eye-right" />
          </div>
          <div className="goblin-body" />
          <div className="goblin-arm-left" />
          <div className="goblin-arm-right" />
          <div className="goblin-leg-left" />
          <div className="goblin-leg-right" />
        </div>
      </div>

      <div className="skeleton-scene">
        <div className="skeleton">
          <div className="skeleton-head">
            <div className="skeleton-eye-left" />
            <div className="skeleton-eye-right" />
          </div>
          <div className="skeleton-body" />
          <div className="skeleton-arm-left" />
          <div className="skeleton-arm-right" />
          <div className="skeleton-leg-left" />
          <div className="skeleton-leg-right" />
        </div>
      </div>

      <div className="orc-scene">
        <div className="orc">
          <div className="orc-head">
            <div className="orc-eye-left" />
            <div className="orc-eye-right" />
          </div>
          <div className="orc-body" />
          <div className="orc-arm-left" />
          <div className="orc-arm-right" />
          <div className="orc-leg-left" />
          <div className="orc-leg-right" />
        </div>
      </div>

      <div className="knight-scene">
        <div className="knight">
          <div className="knight-helmet">
            <div className="knight-visor" />
          </div>
          <div className="knight-body" />
          <div className="knight-arm-left" />
          <div className="knight-arm-right" />
          <div className="knight-leg-left" />
          <div className="knight-leg-right" />
        </div>
      </div>

      {/* Particles */}
      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
      </div>

      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="scanline" />

      {/* Corner decorations */}
      <div className="corner-decor corner-tl" />
      <div className="corner-decor corner-tr" />
      <div className="corner-decor corner-bl" />
      <div className="corner-decor corner-br" />

      {/* Main content */}
      <div className="menu-content">
        <div className="title-container">
          <h1 className="title-main">RULE</h1>
          <div className="subtitle">WEB EDITION</div>
        </div>

        <p className="tagline">Enter the labyrinth. Fight monsters. Survive the darkness.</p>

        <div className="features">
          <div className="feature-badge">
            <span className="feature-icon">⚔️</span>
            <span>Turn-Based Combat</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">🛡️</span>
            <span>Equipment System</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">🏰</span>
            <span>3D Dungeon</span>
          </div>
        </div>

        <a href="/api/login" className="cta-button" data-testid="button-start-adventure">
          START YOUR ADVENTURE
        </a>
      </div>
    </div>
  );
}
