import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var mapboxgl: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {

  lat!: number;
  lng!: number;


  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let geo = this.route.snapshot.paramMap.get('geo');
    if (geo) {
      geo = geo.substring(4);
      const geoCords = geo.split(',');
      this.lat = Number(geoCords[0]);
      this.lng = Number(geoCords[1]);
      console.log(this.lat, this.lng);
    }
  }

  ngAfterViewInit(): void {
    if (this.lat && this.lng) {
      mapboxgl.accessToken = 'pk.eyJ1IjoiYnltYW51ZWwxMTgiLCJhIjoiY2xoa3JhdWx0MGZzdzNqbXVwdmJ5azhhYiJ9.iAp-_ZtlqAv98M08b82m9g';
      const map = new mapboxgl.Map({
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/light-v11',
        center: [this.lng, this.lat],
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        container: 'map',
        antialias: true
      });

      const marker = new mapboxgl.Marker({
        draggable: false
      }).setLngLat([this.lng, this.lat])
      .addTo(map);

      map.on('style.load', () => {
        // Insert the layer beneath any symbol layer.
        map.resize();

        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
          (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
        ).id;

        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
        // from OpenStreetMap.
        map.addLayer(
          {
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',

              // Use an 'interpolate' expression to
              // add a smooth transition effect to
              // the buildings as the user zooms in.
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );
      });
    }
  }
}
