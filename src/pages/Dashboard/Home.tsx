import { useRef, useState, useEffect } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<string>(new Date().toLocaleString());
  const [confirmTimeIn, setConfirmTimeIn] = useState<boolean>(false);
  const [confirmTimeOut, setConfirmTimeOut] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get User Data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
    return data.image.image_name;
  };

  const handleAttendance = async () => {
    try {
      setIsProcessing(true);
      setError(null);
  
      // Ensure the user is logged in
      if (!user || !user.id) {
        throw new Error("User is not logged in. Please log in again.");
      }
  
      const now = new Date();
      const hours = now.getHours(); // Get current hour (0-23)
      const timestamp = now.toISOString().replace(/[:.]/g, "-");
      const imageDataUrl = await captureImage();
  
      if (!imageDataUrl) throw new Error("No image captured");
      const imageFilename = await uploadImage(imageDataUrl, timestamp);
      if (!imageFilename) throw new Error("Failed to upload image");
  
      // Determine shift dynamically
      let shift = "Open Shift"; // Default to Open Shift
      if (hours >= 6 && hours < 14) {
        shift = "Morning";
      } else if (hours >= 14 && hours < 22) {
        shift = "Afternoon";
      } else if (hours >= 22 || hours < 6) {
        shift = "Night";
      }
  
      const response = await fetch("http://localhost:4000/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, // User ID retrieved correctly
          imageId: imageFilename,
          shifts: shift, // Dynamically assigned shift
          time: now.toISOString(),
        }),
      });
  
      if (!response.ok) throw new Error("Failed to save attendance");
      const data = await response.json();
      const attendance = data.data;
  
      // Toggle between Time In and Time Out
      if (attendance.timeOut) {
        setConfirmTimeIn(false); // Reset for new time-in
        setConfirmTimeOut(true);
      } else {
        setConfirmTimeIn(true);
        setConfirmTimeOut(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 dark:bg-gray-900 dark:text-white">
      <div className="col-span-12 flex flex-col items-center">
        <p className="mb-2 font-semibold text-gray-800 text-sm dark:text-white/90">
          {dateTime}
        </p>

        <video ref={videoRef} autoPlay className="w-96 h-96 border rounded-full object-cover" style={{ transform: "scaleX(-1)" }} />
        <canvas ref={canvasRef} className="hidden" />

        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="w-96 h-96 mt-4 border rounded-full object-cover" />
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-4">
          <button
            onClick={handleAttendance}
            disabled={isProcessing}
            className={`px-4 py-2 ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white rounded`}
          >
            {isProcessing
              ? "Processing..."
              : confirmTimeOut
              ? "Time In Again"
              : confirmTimeIn
              ? "Time Out"
              : "Time In"}
          </button>
        </div>
      </div>
    </div>
  );
}
