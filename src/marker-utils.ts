/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Supports markers of either either "legacy" or "advanced" types.
 */
export type Marker =
  | google.maps.Marker
  | google.maps.marker.AdvancedMarkerElement;

/**
 * util class that creates a common set of convenience functions to wrap
 * shared behavior of Advanced Markers and Markers.
 */
export class MarkerUtils {
  public static isAdvancedMarkerAvailable(map: google.maps.Map): boolean {
    return (
      google.maps.marker &&
      map.getMapCapabilities().isAdvancedMarkersAvailable === true
    );
  }

  public static isAdvancedMarker(
    marker: Marker
  ): marker is google.maps.marker.AdvancedMarkerElement {
    return (
      google.maps.marker &&
      marker instanceof google.maps.marker.AdvancedMarkerElement
    );
  }

  public static setMap(marker: Marker, map: google.maps.Map | null) {
    if (this.isAdvancedMarker(marker)) {
      marker.map = map;
    } else {
      marker.setMap(map);
    }
  }

  public static getPosition(marker: Marker): google.maps.LatLng {
    // SuperClusterAlgorithm.calculate expects a LatLng instance so we fake it for Adv Markers
    if (this.isAdvancedMarker(marker)) {
      if (marker.position) {
        /* 
          TODO: This check doesn't work when a `loader` is used to create the position object.
          The type check sees `marker.position` as a generic `object`, but I'm not sure how to
          fix this. Example `LatLng` object creation to reproduce:
          ```ts
            import {Loader} from '@googlemaps/js-api-loader';

            const loader = new Loader(...);
            const {LatLng} = await loader.importLibrary('core');
            const latLng = new LatLng({lat: latitude, lng: longitude});

            const newAdvancedMarker = new AdvancedMarkerElement({
              position: latLng,
              ...
            });
          ```
        */
        if (marker.position instanceof google.maps.LatLng) {
          return marker.position;
        }
        // since we can't cast to LatLngLiteral for reasons =(
        if (
          marker.position.lat !== null &&
          marker.position.lat !== undefined &&
          marker.position.lng !== null &&
          marker.position.lng !== undefined
        ) {
          return new google.maps.LatLng(
            marker.position.lat,
            marker.position.lng
          );
        }
      }
      return new google.maps.LatLng(null);
    }
    return marker.getPosition();
  }

  public static getVisible(marker: Marker) {
    if (this.isAdvancedMarker(marker)) {
      /**
       * Always return true for Advanced Markers because the clusterer
       * uses getVisible as a way to count legacy markers not as an actual
       * indicator of visibility for some reason. Even when markers are hidden
       * Marker.getVisible returns `true` and this is used to set the marker count
       * on the cluster. See the behavior of Cluster.count
       */
      return true;
    }
    return marker.getVisible();
  }
}
