import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, pipe } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';


@Injectable()
export class MapService {
    private actionUrl: string;
    private httpOptions: any;

    constructor(private http: HttpClient) {
         this.httpOptions = {
            headers: new HttpHeaders({ 
                'Content-Type': 'application/json'
            })
        };
        this.actionUrl = `https://maps.googleapis.com/maps/api/directions/json`;
        //'directions'
    }

    calculateRute(origen, destino) {

        // Intento usar esta API para poder calcular la ruta que debe seguir pero está fallando, no es importante para la aplicación por el momento

        let _url = `${this.actionUrl}?units=metric&origin=${origen}&destination=${destino}&key=AIzaSyBo6eHESsdXqn5ilr7iRr2C4BfcmFJeuO4`;
        console.log('_url', _url);
        return this.http.get<any>(_url, this.httpOptions)
            .pipe(
                map(response => response),
                catchError(this.handleError),
                tap((response: any) => {
                    console.log('calculateRute response',JSON.stringify(response));
                    return response;
                }) 
            );
    }
    
    private handleError(error: any) {
        console.log('errorrr', JSON.stringify(error));
        return Observable.throw(error || 'Server error');
    }

}