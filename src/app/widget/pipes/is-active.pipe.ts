import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';

@Pipe({
  name: 'isActive',
  pure: true // Pipe puro (otimizado)
})
export class IsActivePipe implements PipeTransform {
  constructor(private router: Router) {}

  transform(path: string): boolean {
    const cleanUrl = this.router.url.split('?')[0];
    const fullPath = path.startsWith('/app') ? path : `/app/${path}`;
    return cleanUrl === fullPath;
  }
}
