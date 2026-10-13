export type FavoriteCertificate = {
  id: string;
  name: string;
  category: string;
  job: string;
  registeredAt: string;
};

export type FavoriteInput = Omit<FavoriteCertificate, 'registeredAt'>;

export function toggleFavorite(
  favorites: FavoriteCertificate[],
  name: string,
  certificate?: FavoriteInput,
): FavoriteCertificate[] {
  if (favorites.some(favorite => favorite.name === name)) {
    return favorites.filter(favorite => favorite.name !== name);
  }
  if (!certificate) return favorites;
  return [{ ...certificate, registeredAt: new Date().toISOString() }, ...favorites];
}
