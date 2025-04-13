"use client";

import * as PIXI from 'pixi.js';

import React, { useEffect, useRef } from 'react';

interface Particle {
  sprite: PIXI.Sprite;
  speed: number;
  direction: number;
  rotation: number;
  alpha: number;
  targetAlpha: number;
}

export function PixiBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 清理之前的实例
    if (appRef.current) {
      appRef.current.destroy(true);
      appRef.current = null;
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    try {
      // 创建PIXI应用
      const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
        antialias: true
      });

      // 设置自动调整大小
      window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
      });

      // 将 canvas 添加到容器中
      if (containerRef.current) {
        containerRef.current.appendChild(app.view as unknown as HTMLCanvasElement);
      }
      appRef.current = app;

      // 创建渐变背景
      const background = new PIXI.Graphics();
      app.stage.addChild(background);

      const updateBackground = () => {
        const width = app.screen.width;
        const height = app.screen.height;
        background.clear();
        
        // 创建深蓝色渐变背景
        background.beginFill(0x0c1445);
        background.drawRect(0, 0, width, height);
        background.endFill();
      };

      // 创建网格线
      const createGrid = () => {
        const grid = new PIXI.Graphics();
        app.stage.addChild(grid);
        
        const updateGrid = () => {
          grid.clear();
          grid.lineStyle(0.5, 0x4facfe, 0.15);
          
          // 水平线
          const spacing = 100;
          const rows = Math.ceil(app.screen.height / spacing);
          const cols = Math.ceil(app.screen.width / spacing);
          
          for (let i = 0; i <= rows; i++) {
            grid.moveTo(0, i * spacing);
            grid.lineTo(app.screen.width, i * spacing);
          }
          
          // 垂直线
          for (let i = 0; i <= cols; i++) {
            grid.moveTo(i * spacing, 0);
            grid.lineTo(i * spacing, app.screen.height);
          }
        };
        
        return { grid, updateGrid };
      };

      // 创建粒子
      const createParticles = () => {
        const particles: Particle[] = [];
        const total = Math.min(Math.max(window.innerWidth, window.innerHeight) / 10, 150);

        for (let i = 0; i < total; i++) {
          // 创建粒子精灵
          const size = Math.random() * 2 + 1;
          const graphics = new PIXI.Graphics();
          graphics.beginFill(0x4facfe);
          graphics.drawCircle(0, 0, size);
          graphics.endFill();
          
          // 直接使用Graphics对象
          const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
          sprite.width = size * 2;
          sprite.height = size * 2;
          sprite.tint = 0x4facfe;
          
          app.stage.addChild(sprite);
          
          // 设置粒子初始位置
          sprite.x = Math.random() * app.screen.width;
          sprite.y = Math.random() * app.screen.height;
          sprite.anchor.set(0.5);
          
          // 粒子属性
          particles.push({
            sprite,
            speed: Math.random() * 0.5 + 0.1,
            direction: Math.random() * Math.PI * 2,
            rotation: (Math.random() - 0.5) * 0.01,
            alpha: Math.random() * 0.5 + 0.1,
            targetAlpha: Math.random() * 0.5 + 0.1
          });
        }
        
        return particles;
      };

      // 创建连接线
      const createConnections = () => {
        const connections = new PIXI.Graphics();
        app.stage.addChild(connections);
        
        const updateConnections = (particles: Particle[]) => {
          connections.clear();
          
          const threshold = (Math.min(app.screen.width, app.screen.height) / 4) ** 2;
          
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const p1 = particles[i].sprite;
              const p2 = particles[j].sprite;
              
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const distSq = dx * dx + dy * dy;
              
              if (distSq < threshold) {
                const alpha = (1 - distSq / threshold) * 0.3;
                connections.lineStyle(0.5, 0x4facfe, alpha);
                connections.moveTo(p1.x, p1.y);
                connections.lineTo(p2.x, p2.y);
              }
            }
          }
        };
        
        return { connections, updateConnections };
      };

      // 初始化场景
      updateBackground();
      const { grid, updateGrid } = createGrid();
      updateGrid();
      
      const particles = createParticles();
      particlesRef.current = particles;
      
      const { connections, updateConnections } = createConnections();
      updateConnections(particles);

      // 创建光晕扫描线
      const scanLine = new PIXI.Graphics();
      app.stage.addChild(scanLine);
      let scanLinePos = 0;
      
      // 动画循环
      const animate = () => {
        // 更新粒子位置
        for (const particle of particles) {
          const { sprite, speed, direction, rotation } = particle;
          
          // 移动粒子
          sprite.x += Math.cos(direction) * speed;
          sprite.y += Math.sin(direction) * speed;
          
          // 边界检查
          if (sprite.x < 0) sprite.x = app.screen.width;
          if (sprite.x > app.screen.width) sprite.x = 0;
          if (sprite.y < 0) sprite.y = app.screen.height;
          if (sprite.y > app.screen.height) sprite.y = 0;
          
          // 平滑过渡透明度
          sprite.alpha += (particle.targetAlpha - sprite.alpha) * 0.01;
          if (Math.abs(sprite.alpha - particle.targetAlpha) < 0.01) {
            particle.targetAlpha = Math.random() * 0.5 + 0.1;
          }
        }
        
        // 更新连接线
        updateConnections(particles);
        
        // 更新扫描线
        scanLine.clear();
        scanLinePos = (scanLinePos + 0.2) % app.screen.height;
        scanLine.lineStyle(2, 0x4facfe, 0.2);
        scanLine.moveTo(0, scanLinePos);
        scanLine.lineTo(app.screen.width, scanLinePos);
        
        // 请求下一帧
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      // 开始动画
      animate();

      // 窗口大小变化时重新调整
      const handleResize = () => {
        updateBackground();
        updateGrid();
      };
      
      window.addEventListener('resize', handleResize);

      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize);
        if (appRef.current) {
          appRef.current.destroy(true);
          appRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    } catch (error) {
      console.error("PixiBackground初始化错误:", error);
    }
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10" />;
} 