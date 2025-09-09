import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/module.css';
// Import PrismJS theme globally. Since the user has installed
// `prismjs`, this CSS will apply syntax highlighting styles to
// the generated code block in the preview. The import is safe on
// both client and server in a Next.js environment.
import 'prismjs/themes/prism.css';

/**
 * Custom App component to import global styles. The file
 * automatically wraps every page in the application and is used
 * primarily to inject CSS. The rest of the logic is handled at
 * the page level.
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}