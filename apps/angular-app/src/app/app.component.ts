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

  constructor(private http: HttpClient) {
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
    this.isLoading = false;
    this.isConverting = false;
    this.progress = 0;
    this.isDone = false;
    this.convertedGifUrl = '';
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
}
