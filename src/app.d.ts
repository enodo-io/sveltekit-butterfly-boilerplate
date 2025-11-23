// See https://svelte.dev/docs/kit/types#app.d.ts

import type * as Butterfly from '@enodo/butterfly-ts';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    interface PageData {
      settings: Butterfly.Property['attributes'];
      categories: Butterfly.ApiResponse<Butterfly.Category[]>;
      layer: {
        'page.index'?: number;
        'page.query'?: string;
        'content.type': string;
        'content.id'?: number | string;
        'content.group'?: string;
        'content.tags'?: string[];
        'content.flags'?: string[];
      };
      meta: {
        url: string;
        title: string;
        description: string;
        robots?: string;
      };
      scope?: Butterfly.ApiResponse<Butterfly.IResource>;
      feeds?: Record<
        string,
        | MaybePromise<Butterfly.ApiResponse<Butterfly.IResource[]>>
        | Record<string | number, MaybePromise<Butterfly.ApiResponse<Butterfly.IResource[]>>>
      >;
    }
    // interface PageState {}
    // interface Platform {}
  }

  interface Window {
    dataLayer: Record<string, unknown>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  interface Navigator {
    standalone?: boolean;
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }

  interface NetworkInformation {
    downlink?: number;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    rtt?: number;
    saveData?: boolean;
  }

  namespace svelteHTML {
    interface HTMLAttributes {
      onclickoutside?: (event: CustomEvent) => void;
    }
  }
}

export {};
