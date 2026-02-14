// Generates a deterministic avatar URL using DiceBear
export const getAvatarUrl = (seed) => {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
    seed
  )}`;
};
