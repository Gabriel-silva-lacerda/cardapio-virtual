import { Injectable } from '@angular/core';
import { environment } from '@enviroment/environment.development';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService extends BaseSupabaseService {
  protected override table = 'images';

  async uploadImage(file: File, path: string): Promise<string | null> {
    const { data, error } = await this.supabaseService.supabase.storage.from('images').upload(path, file, { upsert: true });
    if (error) {
      this.toast.error('Erro no upload');
      return null;
    }
    return data?.path || null;
  }

  async deleteImage(image_url: string): Promise<boolean> {
    const imageUrl = image_url;
    if (imageUrl) {
      const imagePath = imageUrl.split(environment.SUPABASE_STORAGE);

      const { error } = await this.supabaseService.supabase.storage.from('images').remove(imagePath);

      if (error) {
        this.toast.error('Erro ao deletar imagem do Storage')
        return false;
      }
    }

    return true;
  }

  async getImageUrl(imagePath: string): Promise<string | null> {
    const { data, error } = await this.supabaseService.supabase.storage
      .from('images')
      .createSignedUrl(imagePath, 3600);

    if (error) {
      this.toast.error('Erro ao buscar a imagem');
      return null;
    }

    return data?.signedUrl || null;
  }
}
