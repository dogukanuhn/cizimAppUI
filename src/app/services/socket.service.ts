import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";
@Injectable({
  providedIn: 'root'
})
export class SocketService {

  
  public apiUrl = "https://192.168.2.36:45455/"
  public connection = new signalR.HubConnectionBuilder().withUrl(this.apiUrl+ "chathub", {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets
  }).configureLogging(signalR.LogLevel.Error).build();  
  

  constructor() { }


  

 
}
