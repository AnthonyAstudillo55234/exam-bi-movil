import { Component, OnInit } from '@angular/core';
import { IonicModule, ActionSheetController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService, Message } from '../services/chat.service';
import { NgIf, NgFor } from '@angular/common';

import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  previewImage: string | null = null;

  constructor(
    private chatService: ChatService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.chatService.getMessages().subscribe(res => {
      this.messages = res;
    });
  }

  sendMessage() {
    const msg = this.newMessage.trim();
    if (msg === '') {
      return;
    }

    if (msg.toLowerCase().startsWith('/pokemon ')) {
      const pokemonName = msg.substring(9).toLowerCase();
      this.fetchPokemon(pokemonName);
      this.newMessage = '';
    } else {
      this.chatService.sendMessage(msg, this.userName);
      this.newMessage = '';
    }
  }

  async fetchPokemon(name: string) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!response.ok) {
        throw new Error('Pokémon no encontrado');
      }
      const data = await response.json();

      const abilities = data.abilities
        .map((a: any) => a.ability.name)
        .join(', ');

      // Texto con nombre y habilidades
      const text = `Pokémon: ${data.name}\nHabilidades: ${abilities}`;

      // Mensaje texto
      this.chatService.sendMessage(text, this.userName);

      // Mensaje con imagen
      const imageUrl = data.sprites.front_default;
      if (imageUrl) {
        this.chatService.sendMessage(imageUrl, this.userName);
      }
    } catch (error) {
      this.chatService.sendMessage(`Error: No se encontró el Pokémon "${name}"`, this.userName);
    }
  }

  async sendLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const lat = coordinates.coords.latitude;
      const lon = coordinates.coords.longitude;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
      this.chatService.sendMessage(mapsUrl, this.userName);
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }
  }

  async sendPhoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Enviar imagen',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera',
          handler: () => this.captureImage(CameraSource.Camera)
        },
        {
          text: 'Elegir desde galería',
          icon: 'image',
          handler: () => this.captureImage(CameraSource.Photos)
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async captureImage(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source
      });

      this.previewImage = `data:image/jpeg;base64,${image.base64String}`;

      const alert = await this.alertCtrl.create({
        header: '¿Enviar esta imagen?',
        message: `<img src="${this.previewImage}" style="width: 100%; border-radius: 10px;" />`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              this.previewImage = null;
            }
          },
          {
            text: 'Enviar',
            handler: () => {
              this.chatService.sendMessage(this.previewImage!, this.userName);
              this.previewImage = null;
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error al capturar imagen:', error);
    }
  }

  async showInstructions() {
    const alert = await this.alertCtrl.create({
      header: 'Instrucciones',
      message: 'Para buscar un Pokémon escribe: <strong>/pokemon nombre_del_pokemon</strong> y presiona enviar.<br>Ejemplo: <em>/pokemon pikachu</em>',
      buttons: ['OK']
    });
    await alert.present();
  }
}
