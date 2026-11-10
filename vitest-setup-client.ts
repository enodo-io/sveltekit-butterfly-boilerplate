/// <reference types="vitest/browser" />

import { vi } from 'vitest';

// `$env/dynamic/public` has no runtime in browser component tests (it is read by
// $lib/dataLayer for the Butterfly tracker). Specs that need values mock it themselves.
vi.mock('$env/dynamic/public', () => ({ env: {} }));
