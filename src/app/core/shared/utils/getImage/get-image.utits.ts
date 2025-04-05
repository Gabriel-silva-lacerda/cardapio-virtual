import { environment } from "@enviroment/environment.development";

export function getImageUrl(imagePath: string | null): string | null {
  return imagePath ? `${environment.SUPABASE_STORAGE}/${imagePath}` : null;
}
