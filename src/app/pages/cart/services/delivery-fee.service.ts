import { inject, Injectable } from '@angular/core';
import { environment } from '@enviroment/environment';
import {
  MapboxDirectionsResponse,
  MapboxGeocodingResponse,
} from '@shared/interfaces/max-box/max-box.interface';
import { BaseService } from '@shared/services/base/base.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeliveryFeeService extends BaseService {
  private mapboxToken = environment.MAPBOX_TOKEN;
  private cacheExpirationTime = environment.DELIVERY_FEE_CACHE_EXPIRATION;
  private localStorageService = inject(LocalStorageService);
  private geocodeUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
  private directionsUrl =
    'https://api.mapbox.com/directions/v5/mapbox/driving/';

  constructor() {
    super();
  }

  getCoordinatesFromAddress(address: string): Observable<number[] | null> {
    const encodedAddress = encodeURIComponent(address);
    const url = `${this.geocodeUrl}${encodedAddress}.json?access_token=${this.mapboxToken}&country=BR&limit=1&language=pt`;

    return this.http.get<MapboxGeocodingResponse>(url).pipe(
      map((res) => {
        if (!res.features || res.features.length === 0) {
          console.warn('Nenhum resultado encontrado para o endereço:', address);
          return null;
        }

        const coords = res.features[0].center;
        return coords;
      }),
      catchError((err) => {
        console.error('Erro ao buscar coordenadas:', err);
        return of(null);
      })
    );
  }

  calculateDistance(
    origin: number[],
    destination: number[]
  ): Observable<number> {
    if (
      !origin ||
      !destination ||
      origin.length !== 2 ||
      destination.length !== 2
    ) {
      console.error('Coordenadas inválidas:', { origin, destination });
      return of(0);
    }

    const [lon1, lat1] = origin;
    const [lon2, lat2] = destination;
    const coordinates = `${lon1},${lat1};${lon2},${lat2}`;
    const url = `${this.directionsUrl}${coordinates}.json?access_token=${this.mapboxToken}&geometries=geojson&overview=full`;

    return this.http.get<MapboxDirectionsResponse>(url).pipe(
      map((res) => {
        if (!res.routes || res.routes.length === 0) {
          console.warn('Nenhuma rota encontrada');
          return 0;
        }

        const distanceInMeters = res.routes[0].distance;
        const distanceInKm = distanceInMeters / 1000;
        return distanceInKm;
      }),
      catchError((err) => {
        console.error('Erro ao calcular distância:', err);
        return of(0);
      })
    );
  }

  getDeliveryFee(
    originAddress: string,
    destinationAddress: string,
    feePerKm: number = 2
  ): Observable<number> {
    const cachedFee = this.localStorageService.getItem<number>('deliveryFee');
    const lastAddress =
      this.localStorageService.getItem<string>('lastClientAddress');
    const cachedTimestamp = this.localStorageService.getItem<number>(
      'deliveryFeeTimestamp'
    );

    const now = Date.now();
    const cacheExpired =
      cachedTimestamp && now - cachedTimestamp > this.cacheExpirationTime;

    if (cachedFee && lastAddress === destinationAddress && !cacheExpired) {
      console.log('Usando taxa de entrega do cache');
      return of(cachedFee);
    }

    return forkJoin([
      this.getCoordinatesFromAddress(originAddress),
      this.getCoordinatesFromAddress(destinationAddress),
    ]).pipe(
      switchMap(([origin, destination]) => {
        if (!origin || !destination) {
          console.warn(
            'Não foi possível obter coordenadas para um ou ambos endereços'
          );
          return of(0);
        }
        return this.calculateDistance(origin, destination);
      }),
      map((distanceKm) => {
        const calculatedFee = Math.round(distanceKm * feePerKm * 100) / 100;
        this.localStorageService.setItem('deliveryFee', calculatedFee);
        this.localStorageService.setItem(
          'lastClientAddress',
          destinationAddress
        );
        this.localStorageService.setItem('deliveryFeeTimestamp', now);

        return calculatedFee;
      })
    );
  }
}
