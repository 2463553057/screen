"use client";

import dynamic from 'next/dynamic';

// 动态导入PixiBackground组件，禁用SSR
const PixiBackground = dynamic(() => import('./PixiBackground').then(mod => mod.PixiBackground), {
  ssr: false
});

export function ClientBackground() {
  return <PixiBackground />;
} 