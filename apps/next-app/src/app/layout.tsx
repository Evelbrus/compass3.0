import React, { JSX, ReactNode } from 'react';
import { metadata } from '@shared/metadata/metadata';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ToastManager } from '@shared/components/toast/ToastManager';
import '@shared/styles/globals.css';
import '@shared/styles/react-datepicker-custom.css';
import '@shared/styles/welcomeIcon.css';

export { metadata };

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = async ({ children }: RootLayoutProps): Promise<JSX.Element> => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>{String(metadata.title)}</title>
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <ToastManager />
      </body>
    </html>
  );
};

export default RootLayout;
