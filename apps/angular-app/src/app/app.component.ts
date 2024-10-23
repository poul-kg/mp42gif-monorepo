import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'mp42gif-web';
  selectedFile: File | null = null;
  selectedFileName = '';
  convertedGifUrl: string | null = null;
  isLoading = false;
  isConverting = false;
  isDone = false;
  progress = 0;
  errorMsg = '';
  isInvalidFile = false;

  constructor(private http: HttpClient) {
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
    this.isLoading = false;
    this.isConverting = false;
    this.progress = 0;
    this.isDone = false;
    this.convertedGifUrl = '';
    this.errorMsg = '';
    this.isInvalidFile = false;

    if (this.selectedFile) {
      try {
        await this.validateVideo(this.selectedFile);
      } catch (errMsg) {
        this.isInvalidFile = true;
        if (typeof errMsg === 'string') {
          this.errorMsg = errMsg;
        } else {
          this.errorMsg = 'Unknown video file error';
        }
      }
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert('Please select an MP4 file to upload.');
      return;
    }
    this.selectedFileName = this.selectedFile.name;

    const formData = new FormData();
    formData.append('video', this.selectedFile);

    this.isLoading = true;
    this.progress = 0;
    this.http.post('http://127.0.0.1:3000/convert', formData, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events',
    }).subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((event.loaded / event.total) * 100);
          if (this.progress === 100) {
            this.isConverting = true;
          }
        } else if (event.type === HttpEventType.Response) {
          this.isLoading = false;
          const blob = new Blob([event.body!], { type: 'image/gif' });
          this.convertedGifUrl = URL.createObjectURL(blob);
          this.isConverting = false;
          this.isDone = true;
        }
      },
      (err) => {
        console.error('Upload error:', err);
        this.isLoading = false;
        this.errorMsg = err.message;
      },
    );
  }

  onDownload(): void {
    if (this.convertedGifUrl) {
      const link = document.createElement('a');
      link.href = this.convertedGifUrl;
      link.download = this.selectedFileName.replace(/\.mp4/gi, '.gif');
      link.click();
    }
  }

  // Function to validate the uploaded video
  validateVideo(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if the file type is MP4
      if (file.type !== 'video/mp4') {
        return reject('File must be an MP4 video.');
      }

      // Create a video element to load the file
      const video = document.createElement('video');
      video.preload = 'metadata';

      // Load the video file
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        // Get video dimensions and duration
        const width = video.videoWidth;
        const height = video.videoHeight;
        const duration = video.duration;

        // Release the object URL
        URL.revokeObjectURL(video.src);

        // Check video resolution
        if (width > 1024 || height > 768) {
          return reject(`Video resolution must not exceed 1024x768. Given file is: ${width}x${height}`);
        }

        // Check video duration
        if (duration > 10) {
          return reject(`Video duration must not exceed 10 seconds. Given file is ${duration} sec`);
        }

        // If all checks pass, resolve the promise
        resolve('Video is valid.');
      };

      // Handle any error during video loading
      video.onerror = () => {
        reject('Failed to load video. Please ensure the file is a valid MP4.');
      };
    });
  }
}
