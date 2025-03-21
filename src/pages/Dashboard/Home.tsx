import { useRef, useState, useEffect } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<string>(new Date().toLocaleString());
  const [confirmTimeIn, setConfirmTimeIn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setError("Error accessing webcam.");
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    startCamera();

    const interval = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopCamera();
      else startCamera();
    });

    return () => {
      clearInterval(interval);
      stopCamera();
    };
  }, []);

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (!context) return null;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      // Flip image horizontally for front camera
      context.translate(canvasRef.current.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      const imageDataUrl = canvasRef.current.toDataURL("image/png");
      setCapturedImage(imageDataUrl);
      return imageDataUrl;
    }
    return null;
  };

  const uploadImage = async (imageDataUrl: string, timestamp: string) => {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `attendance-${timestamp}.png`, { type: "image/png" });

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:4000/uploads", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();

    return data.image.image_name; // Return image name (path or file name)
  };

  const handleTimeIn = async () => {
    try {
      setIsProcessing(true);
      setError(null); // Clear any previous errors

      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-");
      const imageDataUrl = await captureImage();

      if (!imageDataUrl) throw new Error("No image captured");

      const imageFilename = await uploadImage(imageDataUrl, timestamp);

      // Send the attendance data with image filename
      const attendanceRes = await fetch("http://localhost:4000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageFilename, // This should be the correct filename or path
          shifts: "Morning", // Adjust as necessary
          timeIn: now.toISOString(), // This is correct timestamp format
        }),
      });

      if (!attendanceRes.ok) throw new Error("Failed to save attendance");

      setConfirmTimeIn(true);
      console.log("Time In recorded!");
    } catch (error) {
      console.error("Time In Error:", error);
      setError(error.message || "An error occurred while processing Time In.");
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

        <video
          ref={videoRef}
          autoPlay
          className="w-96 h-96 border rounded-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        <canvas ref={canvasRef} className="hidden" />

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-96 h-96 mt-4 border rounded-full object-cover"
          />
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-4">
          <button
            onClick={handleTimeIn}
            disabled={isProcessing || confirmTimeIn}
            className={`px-4 py-2 ${
              isProcessing || confirmTimeIn
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white rounded`}
          >
            {isProcessing
              ? "Processing..."
              : confirmTimeIn
              ? "Already Timed In"
              : "Time In"}
          </button>
        </div>
      </div>
    </div>
  );
}
    