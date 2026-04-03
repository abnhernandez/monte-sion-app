interface DetectedBarcode {
  boundingBox?: DOMRectReadOnly;
  cornerPoints?: ReadonlyArray<{ x: number; y: number }>;
  format?: string;
  rawValue?: string;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

interface BarcodeDetector {
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

declare const BarcodeDetector: {
  prototype: BarcodeDetector;
  new (options?: BarcodeDetectorOptions): BarcodeDetector;
  getSupportedFormats?: () => Promise<string[]>;
};

interface Window {
  BarcodeDetector: typeof BarcodeDetector;
}
