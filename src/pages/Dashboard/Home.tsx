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
      if (!context) return null;
  
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
  
      context.translate(canvasRef.current.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
  
      const imageDataUrl = canvasRef.current.toDataURL("image/png");
      setCapturedImage(imageDataUrl);
  
      return await saveImage(imageDataUrl); // Call saveImage function
    }
    return null;
  };
    
  const saveImage = async (imageDataUrl: string) => {
    const base64Response = await fetch(imageDataUrl);
    const blob = await base64Response.blob();
    const file = new File([blob], `attendance-${timestamp}.png`, { type: "image/png" });

    const formData = new FormData();
    formData.append("image", file);

    console.log("📤 Uploading image:", formData.get("image")); // Debugging output

    const uploadResponse = await fetch("http://localhost:4000/uploads", {
        method: "POST",
        body: formData,
    });

    if (!uploadResponse.ok) {
        console.error("Image upload failed", await uploadResponse.text()); // Log response error
        throw new Error("Image upload failed");
    }

    const uploadData = await uploadResponse.json();
    console.log("Upload response:", uploadData); // Ensure response is logged

    return uploadData.image || null;
};

  const handleTimeIn = async () => {
    try {
      setIsProcessing(true);
  
      // Capture image but DO NOT upload in captureImage
      const imageDataUrl = await captureImage();
  
      if (!imageDataUrl) {
        throw new Error("Failed to capture image.");
      }
  
      // Upload the image ONLY ONCE here
      const base64Response = await fetch(imageDataUrl);
      const blob = await base64Response.blob();
      const file = new File([blob], `attendance-${timestamp}.png`, { type: "image/png" });
  
      const formData = new FormData();
      formData.append("image", file);
  
      console.log("Uploading FormData:", formData.get("image")); // Debugging output
  
      const uploadResponse = await fetch("http://localhost:4000/uploads", {
        method: "POST",
        body: formData,
      });
  
      if (!uploadResponse.ok) throw new Error("Image upload failed");
  
      const uploadData = await uploadResponse.json();
      console.log("Upload response:", uploadData); // Debugging output
  
      // Ensure only one record is saved in attendance
      const attendanceResponse = await fetch("http://localhost:4000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shifts: "Morning", image: uploadData.image }),
      });
  
      if (!attendanceResponse.ok) throw new Error("Time In failed");
  
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
            disabled={isProcessing}
            className={`px-4 py-2 ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
          >
            {isProcessing ? "Processing..." : "Time In"}
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
