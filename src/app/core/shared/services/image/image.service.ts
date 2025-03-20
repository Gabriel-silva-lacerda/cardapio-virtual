import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ImageService extends BaseSupabaseService {
  async uploadImage(file: File, path: string): Promise<string | null> {
    const { data, error } = await this.supabaseService.supabase.storage.from('images').upload(path, file, { upsert: true });
    if (error) {
      console.error('Erro no upload:', error);
      return null;
    }
    return data?.path || null;
  }

  async deleteImage(image_url: string): Promise<boolean> {
    const imageUrl = image_url;
    if (imageUrl) {
      const imagePath = imageUrl.split(environment.SUPABASE_STORAGE);

      const { error: storageError } = await this.supabaseService.supabase.storage.from('images').remove(imagePath);

      if (storageError) {
        this.toastr.error('Erro ao deletar imagem do Storage:', storageError.message)
        return false;
      }
    }

    return true;
  }

  async getImageUrl(imagePath: string): Promise<string | null> {
    const { data, error } = await this.supabaseService.supabase.storage
      .from('images')
      .createSignedUrl(imagePath, 3600); // URL válida por 1 hora

    if (error) {
      console.error('Erro ao buscar a imagem:', error);
      return null;
    }

    return data?.signedUrl || null;
  }
}
