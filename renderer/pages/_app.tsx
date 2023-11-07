import React from 'react';
import type { AppProps } from 'next/app';

import '../styles/globals.css';
import Layout from '../components/Layout';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();


function MyApp({ Component, pageProps }: AppProps) {
  return <QueryClientProvider client={queryClient}>
    <Component {...pageProps} />
  </QueryClientProvider>;
}

export default MyApp;
