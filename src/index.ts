import { registerPlugin } from '@capacitor/core';

import type { SynologyDocsPlugin } from './definitions';

const SynologyDocs = registerPlugin<SynologyDocsPlugin>('SynologyDocs', {
  web: () => import('./web').then(m => new m.SynologyDocsWeb()),
});

export * from './definitions';
export { SynologyDocs };
