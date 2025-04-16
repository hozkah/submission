import React, { useState, useEffect } from "react";
import "../styles/TransitionalBackground.css";

const TransitionalBackground = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of background images to cycle through
  const backgroundImages = [
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  ];

  // Change background image every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="transitional-background">
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`background-image ${
            index === currentImageIndex ? "active" : ""
          }`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className="overlay" />
    </div>
  );
};

export default TransitionalBackground;
