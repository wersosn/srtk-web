import React from "react";
import "./index.css";

export default function BlobBackground() {
  return (
    <svg className="blob-bg" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#f8500a"
        d="M700,200Q680,300,600,350Q520,400,500,480Q480,560,400,550Q320,540,250,500Q180,460,120,400Q60,340,80,250Q100,160,180,120Q260,80,340,60Q420,40,500,70Q580,100,660,140Q700,160,700,200Z"
      />
    </svg>
  );
}
