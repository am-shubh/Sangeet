import { Component, OnInit } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

interface musicList {
  index?: number,
  title?: string,
  source?: File
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'sangeet';
  dropLabel = "Drop Audio Files Here";

  totalTracksInPlaylist = 0;
  counter = 0;

  audio: any;
  singleTrackAvailable: boolean = true;
  isPlaying: boolean = false;

  fileExtensionError: boolean = false;
  fileDupliacteError: boolean = false;

  volumeLevel: any = 0.5;
  volumeStatus: string = 'on';

  musicStatus: string = 'play';

  shufflestatus: string = 'off';
  repeatStatus: string = 'all';

  currentTitle: string = '';
  currentMusicIndex: number = 0;

  totalMusicTime: any = '00:00';
  currentMusicTime: any = '00:00';

  currentMusicTimeInSeconds: any;

  percentageComplete: any = 0.0;

  public files: UploadFile[] = [];

  public uploadedFiles: musicList[] = [];
  public numberOfUploads: number = 0;

  fileUploaded = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  ngOnInit() {
    this.audio = new Audio();

    // Binding different Audio tracks event with functions
    this.audio.onended = this.onMusicEnd.bind(this);
    this.audio.ontimeupdate = this.onTimeUpdate.bind(this);
    this.audio.onloadeddata = this.onMusicLoad.bind(this);

    //  Checking if file upload is complete
    this.fileUploaded.subscribe(
      (isUploaded: boolean) => {
        if (isUploaded === true) {
          // setting the audio source to the first uploaded file by default
          this.audio.src = this.uploadedFiles[0].source;
          this.audio.load();
          this.currentMusicIndex = 0;
          this.currentTitle = this.uploadedFiles[0].title;
          this.isPlaying = true;
          this.musicStatus = 'play';
        } else {
          
        }
      }
    );

  }

  // Toggle between play and pause
  onPlayAndPauseToggle() {
    if (this.audio.paused) {
      this.audio.play();
      this.musicStatus = 'pause';
    } else {
      this.audio.pause();
      this.musicStatus = 'play';
    }
  }

  // Fast Forward 5 Seconds
  onForward() {

    let currentMusicTime: number = this.audio.currentTime;

    currentMusicTime = currentMusicTime + 5;

    if (this.currentMusicTimeInSeconds - currentMusicTime < 5) {
      this.playNext();
    } else {
      this.audio.currentTime = currentMusicTime;
      this.audio.play();
      this.musicStatus = 'pause';
    }

  }

  // Replay or backward 5 seconds
  onBackward() {

    let currentMusicTime: number = this.audio.currentTime;

    if (currentMusicTime < 5) {
      this.playPrevious();
    } else {
      currentMusicTime = currentMusicTime - 5;
      this.audio.currentTime = currentMusicTime;
      this.audio.play();
      this.musicStatus = 'pause';
    }

  }

  // Function called when audio loads
  onMusicLoad(e) {
    this.getTotalTime(e);
  }

  // Function called when time of audio changes
  onTimeUpdate(e) {
    this.getCurentTime(e);
  }

  // Function called when audio ends
  onMusicEnd(e) {
    this.playNext();
  }

  // when stop button is clicked
  onStop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.musicStatus = 'play';
  }

  // Getting total time of audio track
  getTotalTime(e) {

    let totalMusicTime: number = this.audio.duration;
    this.currentMusicTimeInSeconds = totalMusicTime;

    let minutesOfMusic: any = Math.floor(totalMusicTime / 60);
    minutesOfMusic = (minutesOfMusic >= 10) ? minutesOfMusic : "0" + minutesOfMusic;

    let secondsOfMusic: any = Math.floor(totalMusicTime - minutesOfMusic * 60);
    secondsOfMusic = (secondsOfMusic >= 10) ? secondsOfMusic : "0" + secondsOfMusic;

    this.totalMusicTime = minutesOfMusic + ':' + secondsOfMusic;
  }

  // getting current time of audio track
  getCurentTime(e) {

    let currentMusicTime: number = this.audio.currentTime;

    this.percentageComplete = (currentMusicTime / this.currentMusicTimeInSeconds) * 100;

    let minutes: any = Math.floor(currentMusicTime / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;

    let seconds: any = Math.floor(currentMusicTime - minutes * 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;

    this.currentMusicTime = minutes + ':' + seconds;

  }

  // getTracks() {
  //   this.uploadedFiles.forEach((music) => {
  //     console.log(music.title, music.index);
  //   });
  // }

  // Play Next Song, based on whether repeat and shuffle is ON or OFF
  playNext() {
    this.audio.pause();
    this.audio.currentTime = 0;

    // If single file is uploaded
    if (this.totalTracksInPlaylist == 1) {

      if (this.repeatStatus == 'one') {
        this.musicStatus = 'puase';
        this.audio.play();
      } else {
        this.musicStatus = 'play';
      }

    } else {

      // If repeat one mode is ON
      if (this.repeatStatus == 'one') {
        this.musicStatus = 'pause';
        this.audio.play();
      } else {

        // If shuffle is ON
        if (this.shufflestatus == 'on') {

          this.playRandomTracks();

        } else {

          let musicIndex = this.currentMusicIndex + 1;

          if (musicIndex > this.totalTracksInPlaylist - 1) {
            musicIndex = 0;
          }

          this.audio.src = this.uploadedFiles[musicIndex].source;
          this.audio.load();
          this.audio.play();
          this.musicStatus = 'pause';
          this.currentMusicIndex = musicIndex;
          this.currentTitle = this.uploadedFiles[musicIndex].title;

        }

      }

    }

  }

  // Play Previous Song, based on whether repeat and shuffle is ON or OFF
  playPrevious() {

    this.audio.pause();
    this.audio.currentTime = 0;

    // If single file is uploaded
    if (this.totalTracksInPlaylist == 1) {

      // If repeat one mode is ON
      if (this.repeatStatus == 'one') {
        this.musicStatus = 'puase';
        this.audio.play();
      } else {
        this.musicStatus = 'play';
      }

    } else {

      if (this.repeatStatus == 'one') {
        this.musicStatus = 'pause';
        this.audio.play();
      } else {

        // If shuffle is ON
        if (this.shufflestatus == 'on') {

          this.playRandomTracks();

        } else {

          let musicIndex = this.currentMusicIndex - 1;
          if (musicIndex < 0) {
            musicIndex = this.totalTracksInPlaylist - 1;
          }
          this.audio.src = this.uploadedFiles[musicIndex].source;
          this.audio.load();
          this.audio.play();
          this.musicStatus = 'pause';
          this.currentMusicIndex = musicIndex;
          this.currentTitle = this.uploadedFiles[musicIndex].title;

        }

      }

    }
  }

  // when file is drag and dropped
  public dropped(event: UploadEvent) {

    this.files = event.files;
    this.numberOfUploads = event.files.length;

    // For every files uploaded
    for (const droppedFile of event.files) {

      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        const reader = new FileReader();
        fileEntry.file((file: File) => {

          reader.readAsDataURL(file);
          reader.onload = async () => {

            let extensionName = file.name.split('.')[1];

            // checking for file format
            if (extensionName === 'mp3' || extensionName === 'wav') {
              let name = file.name.split('.').slice(0, -1).join('.')
              name = this.toTitleCase(name);

              // checking if uploading for the first time
              if (this.uploadedFiles.length) {
                let filePresent = false;

                // checking if file name already exists
                this.uploadedFiles.forEach((value, index, array) => {

                  if (value.title === name) {
                    filePresent = true;
                  }
            
                })

                if (filePresent) {
                  this.fileDupliacteError = true;
                  this.numberOfUploads = this.numberOfUploads - 1;
                } else {
                  // file not present, hence uploading
                  let fileData = {
                    index: this.counter,
                    title: name,
                    source: reader.result
                  }
                  this.uploadedFiles.push(fileData);
                  this.counter++;
                  this.totalTracksInPlaylist = this.counter;
                  if (this.counter === this.numberOfUploads) {
                    this.fileUploaded.next(true);
                  }
                  if (this.totalTracksInPlaylist > 1) {
                    this.singleTrackAvailable = false;
                  }
                }

              } else {

                let fileData = {
                  index: this.counter,
                  title: name,
                  source: reader.result
                }
                this.uploadedFiles.push(fileData);
                this.counter++;
                this.totalTracksInPlaylist = this.counter;
                if (this.counter === this.numberOfUploads) {
                  this.fileUploaded.next(true);
                }
                if (this.totalTracksInPlaylist > 1) {
                  this.singleTrackAvailable = false;
                }
              }



            } else {
              this.fileExtensionError = true;
              this.numberOfUploads = this.numberOfUploads - 1;
            }

          };

        });

      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        // console.log(droppedFile.relativePath, fileEntry);
      }
    }

  }

  public fileOver(event) {
    // console.log(event);
  }

  public fileLeave(event) {
    // console.log(event);
  }

  // converting file names to Title case
  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  // When time slider is changed
  onSliderChange(event: any) {

    this.percentageComplete = event.value;
    this.audio.currentTime = this.currentMusicTimeInSeconds * (this.percentageComplete / 100);

  }

  // on cancelling the file extension error
  onDismissError() {
    this.fileExtensionError = false;
  }

  // on cancelling the file duplication error
  onDismissDuplicateError() {
    this.fileDupliacteError = false;
  }

  // Playing tracks by clicking from the list
  playTrack(index: number) {
    this.audio.pause();
    this.audio.src = this.uploadedFiles[index].source;
    this.audio.load();
    this.audio.play();
    this.musicStatus = 'pause';
    this.currentMusicIndex = index;
    this.currentTitle = this.uploadedFiles[index].title;

  }

  // on change of volume slider
  onVolumeChange(event: any) {
    this.volumeLevel = event.value;
    this.audio.volume = this.volumeLevel;
  }

  // changing the icon of volume
  toggleVolume() {
    if (this.volumeStatus === 'on') {
      this.volumeStatus = 'mute';
      this.audio.volume = 0;
    } else {
      this.volumeStatus = 'on';
      this.audio.volume = this.volumeLevel;
    }
  }

  // playing random tracks, when shuffle is ON
  playRandomTracks() {
    let musicIndex = Math.floor((Math.random() * this.totalTracksInPlaylist - 1) + 1);
    this.audio.src = this.uploadedFiles[musicIndex].source;
    this.audio.load();
    this.audio.play();
    this.musicStatus = 'pause';
    this.currentMusicIndex = musicIndex;
    this.currentTitle = this.uploadedFiles[musicIndex].title;
  }

  // changing Shuffle Icon
  shuffleList() {
    if (this.shufflestatus === 'on') {
      this.shufflestatus = 'off';
    } else {
      this.shufflestatus = 'on';
    }
  }

  // changing Repeat icon
  repeatToggle() {
    if (this.repeatStatus === 'all') {
      this.repeatStatus = 'one';
    } else {
      this.repeatStatus = 'all';
    }
  }

}
