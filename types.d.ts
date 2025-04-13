// 为未定义类型的模块提供声明
declare module "*";

// 特定模块声明
declare module "@pixi/react" {
  import * as PIXI from "pixi.js";
  import * as React from "react";
  
  export interface StageProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
    options?: {
      backgroundAlpha?: number;
      backgroundColor?: number;
      height?: number;
      width?: number;
      antialias?: boolean;
      autoDensity?: boolean;
      resolution?: number;
    };
    onMount?: (app: PIXI.Application) => void;
  }
  
  export function Stage(props: StageProps): JSX.Element;
  export function PixiComponent<P>(name: string, options: any): React.FC<P>;
}

// 扩展Window接口
interface Window {
  // 添加任何可能在项目中使用的全局变量
  [key: string]: any;
}

// 允许导入图片和其他资源
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.gif";
declare module "*.css";
declare module "*.scss";

// 处理未声明的库
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }
} 