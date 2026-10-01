export {};

declare global {
  interface Window {
    stoutpod: {
      platform: string;
    };
  }
}