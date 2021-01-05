import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Marker } from '../../classes/marker.class';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog  } from '@angular/material/dialog';
import { MapEditComponent } from './map-edit.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {

  lat = 51.678418;
  lng = 7.809007;

  markers: Marker[] = [];
  map: google.maps.Map = null;
  mapClickListener: google.maps.MapsEventListener;

  // https://angular.io/api/core/NgZone
  constructor(private zone: NgZone, private snackBar: MatSnackBar, public dialog: MatDialog ) {
    this.getLocalStorage();
  }


  ngOnInit(): void {
  }

  mapReader( map: google.maps.Map ): void {
    this.map = map;
    this.mapClickListener = this.map.addListener('click', (e: google.maps.MouseEvent) => {
      this.zone.run(() => {
        // Here we can get correct event
        // console.log(e.latLng.lat(), e.latLng.lng());
        const marker = new Marker(e.latLng.lat(), e.latLng.lng());
        this.markers.push(marker);
        this.saveLocalStorage();
        this.snackBar.open('Marcador Agregado', 'Cerrar',  { duration: 3000 });
      });
    });
  }

  saveLocalStorage(): void
  {
    localStorage.setItem('markers', JSON.stringify(this.markers));
  }

  getLocalStorage(): void {
    if ( localStorage.getItem('markers') ){ 
      this.markers = JSON.parse (localStorage.getItem('markers'));
    }
  }

  deleteMarker( indice: number ): void {
    console.log('borrando marcador');
    this.markers.splice(indice , 1);
    this.saveLocalStorage();
    this.snackBar.open('Marcador Borrado', 'Cerrar', { duration: 3000 });

  }

  editMarker( marker: Marker): void {
    const dialogRef = this.dialog.open( MapEditComponent, {
      width: '250px',
      data: { titulo: marker.titulo, descripcion: marker.descripcion }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if ( !result ) {
        return;
      }

      marker.titulo = result.titulo;
      marker.descripcion = result.descripcion;
      this.saveLocalStorage();
    });
  }

  ngOnDestroy(): void {
    if (this.mapClickListener) {
      this.mapClickListener.remove();
    }
  }


}
