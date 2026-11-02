import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, LpoModel } from '../models/lpo.model';
import { LpoDtlsModel } from '../models/lpo-dtls.model';

@Injectable({
  providedIn: 'root'
})
export class LpoService {

  private readonly apiUrl =
    'https://localhost:7247';

  constructor(private readonly http: HttpClient) {}

  getAllLpo(): Observable<ApiResponse<LpoModel[]>> {
    return this.http.get<ApiResponse<LpoModel[]>>(this.apiUrl+"/LpoApi/GetAllLpo");
  }
  getLpoById(id: string): Observable<ApiResponse<LpoModel>> {
    return this.http.get<ApiResponse<LpoModel>>(this.apiUrl+"/LpoApi/GetLpo/"+id);
  }
  getLpoDtlsById(id: string): Observable<ApiResponse<LpoDtlsModel[]>> {
    return this.http.get<ApiResponse<LpoDtlsModel[]>>(this.apiUrl+"/LpoApi/GetLpoDetails/"+id);
  }
} 