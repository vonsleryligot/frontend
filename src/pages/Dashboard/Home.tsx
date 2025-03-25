import { useRef, useState, useEffect } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [dateTime, setDateTime] = useState<string>(new Date().toLocaleString());
  const [hasTimedIn, setHasTimedIn] = useState<boolean>(false);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    fetchAttendanceStatus();

    return () => {
      clearInterval(interval);
      stopCamera();
    };
  }, []);

  const fetchAttendanceStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:4000/attendances/latest/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch latest attendance");
      const data = await res.json();
      const attendance = data.data;

      if (attendance) {
        setHasTimedIn(true);
        setHasTimedOut(!!attendance.timeOut);
      } else {
        setHasTimedIn(false);
        setHasTimedOut(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (!context) return null;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.translate(canvasRef.current.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      return canvasRef.current.toDataURL("image/png");
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

      if (!user || !user.id) throw new Error("User is not logged in.");

      const now = new Date();
      const hours = now.getHours();
      const timestamp = now.toISOString().replace(/[:.]/g, "-");

      const imageDataUrl = await captureImage();
      if (!imageDataUrl) throw new Error("No image captured");

      const imageFilename = await uploadImage(imageDataUrl, timestamp);

      let shift = "Open Shift";
      if (hours >= 6 && hours < 14) shift = "Morning";
      else if (hours >= 14 && hours < 22) shift = "Afternoon";
      else if (hours >= 22 || hours < 6) shift = "Night";

      const res = await fetch("http://localhost:4000/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageId: imageFilename,
          shifts: shift,
          time: now.toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save attendance");

      // Update UI state based on result
      if (!hasTimedIn) {
        setHasTimedIn(true);
        setHasTimedOut(false);
      } else {
        setHasTimedOut(true);
        setHasTimedIn(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unexpected error.");
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

        <video
          ref={videoRef}
          autoPlay
          className="w-96 h-96 border rounded-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-4">
          {(!hasTimedIn || (hasTimedIn && hasTimedOut)) && (
            <button
              onClick={handleAttendance}
              disabled={isProcessing}
              className={`px-4 py-2 ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white rounded`}
            >
              {isProcessing ? "Processing..." : "Time In"}
            </button>
          )}

          {hasTimedIn && !hasTimedOut && (
            <button
              onClick={handleAttendance}
              disabled={isProcessing}
              className={`px-4 py-2 ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white rounded`}
            >
              {isProcessing ? "Processing..." : "Time Out"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
