import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }


  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting location', error);
      throw error;
    }
  }

  async checkPermissions() {
    const permissions = await Geolocation.checkPermissions();
    return permissions;
  }

  async requestPermissions() {
    const permissions = await Geolocation.requestPermissions();
    return permissions;
  }
}


