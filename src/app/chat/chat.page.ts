import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService, Message } from '../services/chat.service';
import { NgIf, NgFor } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit {
  messages: Message[] = [];
  newMessage = '';
  userName = 'Anthony Astudillo';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getMessages().subscribe(res => {
      this.messages = res;
    });
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.chatService.sendMessage(this.newMessage, this.userName);
      this.newMessage = '';
    }
  }

  async sendLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      const locationMessage = `📍 Mi ubicación: \n${mapsUrl}`;
      
      this.chatService.sendMessage(locationMessage, this.userName);
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
    }
  }
}
