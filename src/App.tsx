import { Download, Image as ImageIcon, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Frame1 from "./frame1.png";
import Frame2 from "./frame2.png";
import Frame3 from "./frame3.png";
import Frame4 from "./frame4.png";

const FRAMES = [
  {
    id: "frame1",
    name: "Frame 1",
    url: Frame1,
  },
  {
    id: "frame2",
    name: "Frame 2",
    url: Frame2,
  },
  {
    id: "frame3",
    name: "Frame 3",
    url: Frame3,
  },
  {
    id: "frame4",
    name: "Frame 4",
    url: Frame4,
  },
];

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<string>("lynx-yellow");
  const [frameWidth, setFrameWidth] = useState(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setImage(null); // Clear the cropped image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (crop: Crop) => {
    if (!imgRef.current || !crop.width || !crop.height) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = 460;
    canvas.height = 460;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(460 / 2, 460 / 2, 460 / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw the cropped image
    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      460,
      460
    );

    setImage(canvas.toDataURL());
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const minSize = Math.min(width, height);

    // Start with a circle that's 80% of the minimum dimension
    const cropSize = minSize * 0.8;
    const x = (width - cropSize) / 2;
    const y = (height - cropSize) / 2;

    setCrop({
      unit: "px",
      width: cropSize,
      height: cropSize,
      x: x,
      y: y,
    });
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Set canvas size to 460x460
      canvas.width = 460;
      canvas.height = 460;

      // Calculate dimensions to maintain aspect ratio
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.save();
      ctx.beginPath();
      ctx.arc(230, 230, 230 - frameWidth / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, startX, startY, size, size, 0, 0, 460, 460);
      ctx.restore();

      // Load and draw the frame
      const frameImg = new Image();
      frameImg.src =
        FRAMES.find((f) => f.id === selectedFrame)?.url || FRAMES[0].url;
      frameImg.onload = () => {
        ctx.drawImage(frameImg, 0, 0, 460, 460);
      };
    };
  }, [image, selectedFrame, frameWidth]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "github-avatar.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Lynx GitHub Avatar Studio
          </h1>
          <p className="text-gray-600">
            Upload an image, choose a frame, and create your Lynxified GitHub
            avatar
          </p>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl md:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-12 px-4 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <Upload className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-600">Choose an image</span>
                  </label>
                </div>
              </div>

              {originalImage && !image && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Crop Image
                  </label>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      aspect={1}
                      circularCrop
                      minWidth={50}
                      minHeight={50}
                    >
                      <img
                        ref={imgRef}
                        src={originalImage}
                        className="max-w-full"
                        alt="Upload"
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCropComplete(crop)}
                    className="flex items-center justify-center w-full px-4 py-3 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Apply Circle Crop
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Frame
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {FRAMES.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedFrame === frame.id
                          ? "border-indigo-600 ring-2 ring-indigo-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={frame.url}
                        alt={frame.name}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Frame Width: {frameWidth}px
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={frameWidth}
                  onChange={(e) => setFrameWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square">
                {image ? (
                  <canvas ref={canvasRef} className="w-full h-full" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                )}
              </div>

              <button
                onClick={handleDownload}
                disabled={!image}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white ${
                  image
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-400 cursor-not-allowed"
                } transition-colors`}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Avatar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
