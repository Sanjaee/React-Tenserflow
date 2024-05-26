import { useRef, useState, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      console.log("Loading model...");
      const model = await cocoSsd.load();
      console.log("Model loaded.");
      detectFrame(videoRef.current, model);
    };

    const detectFrame = (video, model) => {
      model.detect(video).then((predictions) => {
        setDetections(predictions);
        renderPredictions(predictions);
        requestAnimationFrame(() => detectFrame(video, model));
      });
    };

    const renderPredictions = (predictions) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "#00FFFF";
        ctx.font = "18px Arial";
        ctx.fillText(
          `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
          x,
          y > 10 ? y - 5 : 10
        );
      });
    };

    const startVideo = () => {
      console.log("Starting video...");
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: "environment" },
        })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded, playing video...");
            videoRef.current.play();
            loadModel();
          };
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
        });
    };

    startVideo();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          backgroundColor: "black",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "80%",
          left: "10%",
          zIndex: 3,
          color: "white",
        }}
      >
        {detections.map((detection, index) => (
          <div key={index}>
            {detection.class} - {Math.round(detection.score * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
};

export default Camera;
