import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  if (!locale) {
    // 防止locale为undefined
    locale = 'zh';
  }
  
  return {
    locale,
    messages: (await import(`../../messages/${locale}/index.json`)).default
  };
}); 