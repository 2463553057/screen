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
  const [isLowPerformanceMode, setIsLowPerformanceMode] = React.useState(false);
  const [userInteracted, setUserInteracted] = React.useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioClosedRef = useRef<boolean>(false);

  // 检测是否在屏幕共享页面，如果是则自动降低性能
  useEffect(() => {
    const isScreenSharingPage = window.location.pathname.includes('/host') || window.location.pathname.includes('/join');
    setIsLowPerformanceMode(isScreenSharingPage);
  }, []);

  // 处理用户交互以允许音频和动画播放
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        
        // 确保之前的音频上下文已关闭
        cleanupAudio();
        audioClosedRef.current = false;
        
        // 创建音频上下文（需要用户交互）
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const context = new AudioContextClass();
            audioContextRef.current = context;
            
            // 创建一个静音音源并播放，确保音频上下文激活
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            gainNode.gain.value = 0; // 静音
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.start(0);
            oscillator.stop(0.1); // 短暂播放后停止
          }
        } catch (error) {
          console.warn('无法创建音频上下文:', error);
        }
      }
    };

    // 添加各种用户交互事件监听
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('mousemove', handleUserInteraction);

    return () => {
      // 移除事件监听
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
    };
  }, [userInteracted]);

  // 音频资源管理
  const loadAudioResource = async (url: string) => {
    if (!userInteracted || !audioContextRef.current) {
      console.warn('音频未启用，跳过加载');
      return null;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('音频加载失败:', error);
      return null;
    }
  };

  // 播放音频
  const playAudio = (audioBuffer: AudioBuffer) => {
    if (!userInteracted || !audioContextRef.current) {
      console.warn('音频未启用，跳过播放');
      return;
    }

    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      console.error('音频播放失败:', error);
    }
  };

  // 清理音频资源
  const cleanupAudio = () => {
    // 检查是否已关闭，避免重复关闭
    if (audioContextRef.current && !audioClosedRef.current) {
      try {
        console.log('正在关闭AudioContext...');
        audioContextRef.current.close();
        audioClosedRef.current = true;
      } catch (error) {
        console.warn('关闭AudioContext失败:', error);
      } finally {
        audioContextRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 使用错误捕获包装整个PIXI应用初始化和运行
    const initPixiApp = () => {
      try {
        // 清理之前的实例
        if (appRef.current) {
          appRef.current.destroy(true);
          appRef.current = null;
          if (animationFrameRef.current) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }
      
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
          // 在低性能模式下减少粒子数量
          const total = isLowPerformanceMode ? 
            Math.min(Math.max(window.innerWidth, window.innerHeight) / 30, 40) : 
            Math.min(Math.max(window.innerWidth, window.innerHeight) / 10, 150);

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
            try {
              // 安全检查
              if (!connections || !particles || !particles.length) return;
              
              connections.clear();
              
              // 获取屏幕尺寸（带默认值）
              const screenSize = getDefaultScreenSize();
              const threshold = (Math.min(screenSize.width, screenSize.height) / 4) ** 2;
              
              for (let i = 0; i < particles.length; i++) {
                if (!particles[i] || !particles[i].sprite) continue;
                
                for (let j = i + 1; j < particles.length; j++) {
                  if (!particles[j] || !particles[j].sprite) continue;
                  
                  const p1 = particles[i].sprite;
                  const p2 = particles[j].sprite;
                  
                  if (!p1 || !p2) continue;
                  
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
            } catch (err) {
              console.warn('连接线更新错误:', err);
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
        
        // 获取默认尺寸以避免undefined访问
        const getDefaultScreenSize = () => {
          return {
            width: app?.screen?.width || window.innerWidth,
            height: app?.screen?.height || window.innerHeight
          };
        };
        
        // 动画循环
        const animate = () => {
          // 防止组件卸载后继续执行动画
          if (!app || !appRef.current) {
            console.warn('PIXI应用已失效或被销毁，终止动画循环');
            return;
          }
          
          try {
            // 获取屏幕尺寸（带默认值）
            const screenSize = getDefaultScreenSize();
            
            // 在低性能模式下降低动画复杂度
            const particlesToUpdate = isLowPerformanceMode ? 
              particles.filter((_, index) => index % 5 === 0) : // 更少的粒子更新
              particles.filter((_, index) => index % 2 === 0);  // 即使在正常模式也减少更新
            
            // 更新粒子位置
            for (const particle of particlesToUpdate) {
              if (!particle || !particle.sprite) continue;
              
              const { sprite, speed, direction, rotation } = particle;
              
              // 安全检查：如果sprite已被销毁，跳过此粒子
              if (!sprite || !sprite.transform) continue;
              
              // 移动粒子 - 在低性能模式下减慢移动速度
              const speedFactor = isLowPerformanceMode ? 0.3 : 0.7;
              sprite.x += Math.cos(direction) * speed * speedFactor;
              sprite.y += Math.sin(direction) * speed * speedFactor;
              
              // 边界检查
              if (sprite.x < 0) sprite.x = screenSize.width;
              if (sprite.x > screenSize.width) sprite.x = 0;
              if (sprite.y < 0) sprite.y = screenSize.height;
              if (sprite.y > screenSize.height) sprite.y = 0;
              
              // 平滑过渡透明度
              sprite.alpha += (particle.targetAlpha - sprite.alpha) * 0.01;
              if (Math.abs(sprite.alpha - particle.targetAlpha) < 0.01) {
                particle.targetAlpha = Math.random() * 0.5 + 0.1;
              }
            }
            
            // 更新连接线
            if (typeof updateConnections === 'function') {
              updateConnections(particlesToUpdate.filter(p => p && p.sprite));
            }
            
            // 更新扫描线
            if (scanLine) {
              scanLine.clear();
              scanLinePos = (scanLinePos + 0.2) % screenSize.height;
              scanLine.lineStyle(2, 0x4facfe, 0.2);
              scanLine.moveTo(0, scanLinePos);
              scanLine.lineTo(screenSize.width, scanLinePos);
            }
          } catch (error) {
            console.error('动画循环错误:', error);
            // 出错时也继续尝试下一帧
          }
          
          // 请求下一帧 - 使用较低的刷新频率
          if (isLowPerformanceMode) {
            // 在低性能模式下使用setTimeout降低刷新率到约10fps
            setTimeout(() => {
              if (appRef.current) { // 确保应用仍然存在
                animationFrameRef.current = requestAnimationFrame(animate);
              }
            }, 100);
          } else {
            // 在普通模式下也稍微降低刷新率
            setTimeout(() => {
              if (appRef.current) { // 确保应用仍然存在
                animationFrameRef.current = requestAnimationFrame(animate);
              }
            }, 50);
          }
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
        return () => {
          // 空清理函数，避免多余的调用
        };
      }
    };
    
    // 调用初始化函数
    return initPixiApp();
  }, [isLowPerformanceMode, userInteracted]);

  // 组件卸载时清理：使用单一的、集中的清理点
  useEffect(() => {
    return () => {
      console.log('组件卸载，执行最终清理');
      // 停止所有动画
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // 销毁PIXI应用
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      
      // 最后清理音频资源
      cleanupAudio();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10" />;
} 