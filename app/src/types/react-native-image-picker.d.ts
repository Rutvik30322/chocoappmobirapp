declare module 'react-native-image-picker' {
  export type MediaType = 'photo' | 'video' | 'mixed';
  
  export interface ImagePickerOptions {
    mediaType?: MediaType;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    includeBase64?: boolean;
    includeExtra?: boolean;
    selectionLimit?: number;
    saveToPhotos?: boolean;
    durationLimit?: number;
    videoQuality?: 'low' | 'medium' | 'high';
    presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  }
  
  export interface Asset {
    uri?: string;
    type?: string;
    name?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    duration?: number;
    base64?: string;
  }
  
  export interface ImagePickerResponse {
    didCancel?: boolean;
    errorCode?: string;
    errorMessage?: string;
    assets?: Asset[];
  }
  
  export function launchImageLibrary(
    options: ImagePickerOptions,
    callback: (response: ImagePickerResponse) => void
  ): void;
  
  export function launchCamera(
    options: ImagePickerOptions,
    callback: (response: ImagePickerResponse) => void
  ): void;
}
