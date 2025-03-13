import { useRef, useState, useEffect } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<string>(new Date().toLocaleString());
  const [confirmTimeIn, setConfirmTimeIn] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null); // Store media stream reference
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const [isProcessing, setIsProcessing] = useState(false);



  useEffect(() => {
    const startCamera = async () => {
      try {
        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }, // Ensures front camera is used
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (error) {
        console.error("Error accessing webcam: ", error);
      }
    };

    startCamera();

    const interval = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else if (!streamRef.current) {
        startCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      stopCamera();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (!context) return;
  
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
  
      // Flip canvas horizontally to fix mirror effect
      context.translate(canvasRef.current.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
  
      const imageDataUrl = canvasRef.current.toDataURL("image/png");
      setCapturedImage(imageDataUrl);
      
      return saveImage(imageDataUrl); // Return promise so it can be awaited
    }
  };
  

  const saveImage = async (imageDataUrl: string) => {
    try {
      const blob = await fetch(imageDataUrl).then((res) => res.blob());
      const formData = new FormData();
      const timestamp = new Date().toISOString().replace(/:/g, "-"); // Format timestamp
      formData.append("image", blob, `time-in-${timestamp}.png`);

      // Send to the backend
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");
      console.log("Image saved successfully!");
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleTimeIn = async () => {
    try {
      setIsProcessing(true);
      await captureImage(); // Ensure image capture completes before proceeding
  
      const response = await fetch("http://localhost:4000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shifts: "Morning" }),
      });
  
      if (!response.ok) throw new Error("Time In failed");
  
      setConfirmTimeIn(true);
      console.log("Time In successful!");
    } catch (error) {
      console.error("Error during Time In:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 p-4 dark:bg-gray-900 dark:text-white">
      <div className="col-span-12 flex flex-col items-center">
        <p className="mb-2 font-semibold text-gray-800 text-sm dark:text-white/90 sm:text-base">
          {dateTime}
        </p>

        {/* Apply mirroring effect to fix inverted video */}
        <video
          ref={videoRef}
          autoPlay
          className="w-96 h-96 border rounded-full object-cover"
          style={{ transform: "scaleX(-1)" }} // Mirror the video preview
        />

        <canvas ref={canvasRef} className="hidden" />

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-96 h-96 mt-4 border rounded-full object-cover"
          />
        )}

        <div className="mt-4 flex gap-4">
          {!confirmTimeIn ? (
            <button
              onClick={handleTimeIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Time In
            </button>
          ) : (
            <button
                onClick={handleTimeIn}
                disabled={isProcessing}
                className={`px-4 py-2 ${
                  isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                } text-white rounded`}
                >
                  {isProcessing ? "Processing..." : "Time In"}
              </button>
          )}
        </div>
      </div>
    </div>
  );
}
