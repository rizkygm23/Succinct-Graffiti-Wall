"use client";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function TestCanvasPage() {
  return (
    <div style={{ background: "#eee", padding: 20 }}>
      <ReactSketchCanvas
        width="500"
        height="300"
        style={{ border: "2px solid #333" }}
        onStroke={() => {
    console.log("Basic: onStroke fired");
        }}
      />
      <p>Coba coret-coret di sini dan lihat log Console!</p>
    </div>
  );
}
