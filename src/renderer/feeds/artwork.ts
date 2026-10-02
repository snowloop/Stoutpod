// Episode artwork wins, then the feed's, otherwise the caller shows a placeholder.
export function resolveArtwork(
  episode: { imageUrl?: string } | undefined,
  feed: { imageUrl?: string } | undefined,
): string | undefined {
  return episode?.imageUrl ?? feed?.imageUrl;
}
