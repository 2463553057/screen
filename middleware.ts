import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的语言列表
  locales: ['zh', 'en'],
  
  // 默认语言
  defaultLocale: 'zh',

  // 本地化存储在cookies中
  localeDetection: true,
});

export const config = {
  // 匹配所有路径，排除api路径和静态资源
  matcher: ['/((?!api|_next|.*\\..*).*)']
}; 