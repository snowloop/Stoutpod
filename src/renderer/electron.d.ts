export {};

declare global {
  interface Window {
    stoutpod: {
      platform: string;
      fetchFeed(url: string): Promise<string>;
    };
  }
}