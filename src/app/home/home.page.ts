import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonButton
  ]
})

export class HomePage {
  query = '';
  musics: any[] = [];
  currentMusic: any = null;
  currentIndex = 0;
  audio = new Audio();
  isPlaying = false;
  isLoop = false;
  isShuffle = false;
  currentTime = 0;
  duration = 0;
  showLyrics = false;
  isMinimized = false;
  lyrics = '';
  parsedLyrics: any[] = [];
  currentLyric = '';
  constructor() {

    this.audio.ontimeupdate = () => {
      this.currentTime = Math.floor(this.audio.currentTime);
    this.duration = Math.floor(this.audio.duration || 0);
    this.updateLyrics();
    };

    this.audio.onended = () => {
      if (this.isLoop) {
        this.audio.play();
        return;
      }
      this.nextMusic();
    };
  }

  async searchMusic() {
  if (!this.query) return;
  const res = await fetch(
    `https://api.nexray.eu.cc/search/youtube?q=${encodeURIComponent(this.query)}`
  );

  const data = await res.json();
  this.musics = data.result || [];
}

  async playMusic(item: any, index: number) {
  this.currentIndex = index;
  this.currentMusic = item;
  const res = await fetch(
    `https://api.nexray.eu.cc/downloader/v1/ytmp3?url=${encodeURIComponent(item.url)}`
  );

  const data = await res.json();
  this.audio.src = data.result.url;
  this.audio.load();
  this.audio.onloadedmetadata = () => {
    this.duration = Math.floor(this.audio.duration);

  };

  this.audio.ontimeupdate = () => {
    this.currentTime = Math.floor(this.audio.currentTime);

  };

  this.audio.onended = () => {
    if (this.isLoop) {
      this.audio.play();
    } else {
      this.nextMusic();
    }
  };

  await this.audio.play();
  this.isPlaying = true;
  this.loadLyrics(
  item.title,
  item.channel || item.author || ''
  );
}

  togglePlay() {

    if (!this.audio.src) return;

    if (this.isPlaying) {

      this.audio.pause();

      this.isPlaying = false;

    } else {

      this.audio.play();

      this.isPlaying = true;

    }

  }

  nextMusic() {

    if (this.musics.length < 1) return;

    let nextIndex;

    if (this.isShuffle) {

      nextIndex = Math.floor(
        Math.random() * this.musics.length
      );

    } else {

      nextIndex = this.currentIndex + 1;

      if (nextIndex >= this.musics.length) {

        nextIndex = 0;

      }

    }

    this.playMusic(
      this.musics[nextIndex],
      nextIndex
    );

  }

  prevMusic() {

    if (this.musics.length < 1) return;

    let prevIndex = this.currentIndex - 1;

    if (prevIndex < 0) {

      prevIndex = this.musics.length - 1;

    }

    this.playMusic(
      this.musics[prevIndex],
      prevIndex
    );

  }

  toggleLoop() {

    this.isLoop = !this.isLoop;

  }

  toggleShuffle() {

    this.isShuffle = !this.isShuffle;

  }

  seekAudio(event: any) {

    this.audio.currentTime = event.target.value;

  }

  formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  toggleLyrics() {

  this.showLyrics =
    !this.showLyrics;
}

async loadLyrics(
  title: string,
  artist: string
) {
  try {
    const res = await fetch(
      `https://api.nexray.eu.cc/search/lyrics?q=${encodeURIComponent(title)}`
    );
    const data = await res.json();
    if (data.status) {
      this.lyrics =
        data.result.lyrics.synced_lyrics ||
        data.result.lyrics.plain_lyrics ||
        '';
      this.parseLyrics();
    } else {
      this.lyrics = 'Lyrics not found 😭';
    }
  } catch (e) {
    console.log(e);
    this.lyrics = 'Lyrics not found 😭';
  }
}

parseLyrics() {
  if (!this.lyrics) return;
  const lines = this.lyrics.split('\n');
  this.parsedLyrics = [];
  for (let line of lines) {
    const match = line.match(
      /\[(\d+):(\d+\.\d+)\](.*)/
    );
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseFloat(match[2]);
      const text = match[3].trim();
      this.parsedLyrics.push({
        time: min * 60 + sec,
        text
      });
    }
  }
}

updateLyrics() {
  for (
    let i = 0;
    i < this.parsedLyrics.length;
    i++
  ) {
    if (
      this.currentTime >=
      this.parsedLyrics[i].time
    ) {
      this.currentLyric =
        this.parsedLyrics[i].text;
    }
  }
}
toggleMinimize() {

  this.isMinimized =
    !this.isMinimized;

}
}