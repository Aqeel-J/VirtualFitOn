import React, { useRef, useEffect, useState } from "react";
import './App.css';
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities"
import tshirt1 from './assets/t-shirt.png';
import tshirt2 from './assets/t-shirt-black.png';
import { FaChevronLeft, FaChevronRight, FaRegHeart, FaHeart, FaFilter, FaXmark } from 'react-icons/fa6'

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [warning, setWarning] = useState("");
  const [selectedTShirt, setSelectedTShirt] = useState(tshirt1); // Initially set to tshirt1
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State variables to store the selected values
  const [price, setPrice] = useState('');
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('');
  const [size, setSize] = useState('');

  // Function to handle change in price selection
  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  // Function to handle change in color selection
  const handleColorChange = (event) => {
    setColor(event.target.value);
  };

  // Function to handle change in style selection
  const handleStyleChange = (event) => {
    setStyle(event.target.value);
  };

  // Function to handle change in size selection
  const handleSizeChange = (event) => {
    setSize(event.target.value);
  };

  useEffect(() => {
    const tShirtImage = new Image();
    tShirtImage.src = selectedTShirt;

    const runPosenet = async () => {
      const net = await posenet.load({
        inputResolution: { width: 720, height: 560 },
        scale: 0.5
      });
      setInterval(() => {
        detect(net);
      }, 100);
    };


    const detect = async (net) => {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        const poses = await net.estimateMultiplePoses(video, {
          maxDetections: 1
        });
        drawCanvas(poses, videoWidth, videoHeight);

        // Calculate waist size and height
        poses.forEach(pose => {
          const leftHip = pose.keypoints.find(keypoint => keypoint.part === 'leftHip');
          const rightHip = pose.keypoints.find(keypoint => keypoint.part === 'rightHip');
          const leftShoulder = pose.keypoints.find(keypoint => keypoint.part === 'leftShoulder');
          const rightShoulder = pose.keypoints.find(keypoint => keypoint.part === 'rightShoulder');

          if (leftHip && rightHip && leftShoulder && rightShoulder) {
            // const waistSize = Math.abs(leftHip.position.x - rightHip.position.x);
            // const height = Math.abs(leftShoulder.position.y - leftHip.position.y);
            // console.log('Waist Size:', waistSize);
            // console.log('Height:', height);
            //at 137cm distance
            // const Actualheight = (height / 4.4);
            // const ActualWidth = (waistSize / 4.4);
            // console.log('Actual height:', Actualheight);
            // console.log('Actual width:', ActualWidth);
            // You can display these measurements on the canvas or output them in some other form
          }
        });
      }
    };

    const drawCanvas = (poses, videoWidth, videoHeight) => {
      const canvas = canvasRef.current;
      if (!canvas) return; // Check if canvasRef.current is null

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, videoWidth, videoHeight); // Clear the canvas before drawing

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      poses.forEach(pose => {
        drawKeypoints(pose.keypoints, 0.5, ctx);
        drawSkeleton(pose.keypoints, 0.5, ctx);

        const leftShoulder = pose.keypoints.find(keypoint => keypoint.part === 'leftShoulder');
        const rightShoulder = pose.keypoints.find(keypoint => keypoint.part === 'rightShoulder');
        const leftHip = pose.keypoints.find(keypoint => keypoint.part === 'leftHip');
        const rightHip = pose.keypoints.find(keypoint => keypoint.part === 'rightHip');
        const nose = pose.keypoints.find(keypoint => keypoint.part === 'nose');

        if (leftShoulder && rightShoulder && leftHip && rightHip && nose) {

          const tShirtWidth = rightShoulder.position.x - leftShoulder.position.x - 80;
          const tShirtHeight = tShirtWidth * (tShirtImage.height / tShirtImage.width);
          const tShirtX = leftShoulder.position.x + 40;
          const tShirtY = leftShoulder.position.y - tShirtHeight - 30;
          // console.log("pose : ", pose);

          if ((nose && nose.position.y < 80) || (leftHip && leftHip.position.y > videoHeight - 80)) {
            setWarning("Please maintain a safe distance from the camera.");
            // console.log('Nose:', nose);
          } else {
            if ((nose && nose.position.y > 120) || (leftHip && leftHip.position.y < videoHeight - 120)) {
              setWarning("Please come close to the camera.");

            } else {
              setWarning("");
              ctx.drawImage(tShirtImage, tShirtX, tShirtY, tShirtWidth, tShirtHeight);
            }
          }
          // ctx.drawImage(tShirtImage, tShirtX, tShirtY, tShirtWidth, tShirtHeight);
        }
      });
    };

    runPosenet();
  }, [selectedTShirt]); // Empty dependency array ensures that this effect runs only once after the component is mounted

  const handleTShirtSelect = (tShirtSrc) => {
    setSelectedTShirt(tShirtSrc); // Update selectedTShirt with the clicked T-shirt source
  };

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
  };

  const handleAddToCartClick = () => {
    setIsAddedToCart(!isAddedToCart);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="https://thirstyforsoulboner.com/cdn/shop/files/Logo_Options_2_eb5ae955-48f3-48f3-a2f5-14d860ec88bd_300x300.png?v=1614321917" alt="Soul Boners" />
      </header>
      <section className="body">
        <div className={`filter-wrapper ${isFilterOpen ? "open" : ""}`}>
          <div className={`filter-container ${isFilterOpen ? "slide-in" : ""}`}>
            <div className="filter-header">
              <button type="button" className="btn-close-filter" onClick={() => setIsFilterOpen(false)}><FaXmark /></button>
            </div>
            {/* Price dropdown */}
            <label htmlFor="price">Price</label>
            <select id="price" value={price} onChange={handlePriceChange}>
              <option value="<1000">Less than 1,000</option>
              <option value="<2000">Less than 2,000</option>
              <option value="<4000">Less than 4,000</option>
              <option value="<8000">Less than 8,000</option>
              <option value="<10000">Less than 10,000</option>
            </select>

            {/* Color dropdown */}
            <label htmlFor="color">Color</label>
            <select id="color" value={color} onChange={handleColorChange}>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              {/* Add more color options as needed */}
            </select>

            {/* Style dropdown */}
            <label htmlFor="style">Style</label>
            <select id="style" value={style} onChange={handleStyleChange}>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="distinct">Distinct</option>
              {/* Add more style options as needed */}
            </select>

            {/* Size dropdown */}
            <label htmlFor="size">Size</label>
            <select id="size" value={size} onChange={handleSizeChange}>
              <option value="s">S</option>
              <option value="m">M</option>
              <option value="l">L</option>
              <option value="xl">XL</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-3">
            <div className="video-container">
              <Webcam
                ref={webcamRef}
                className="webcam"
              />

              <canvas
                ref={canvasRef}
                className="overlay-canvas"
              />
              {warning && (
                <div className="warning">
                  <p>{warning}</p>
                </div>
              )}
              <div className="btn-container">
                <button type="button" className="btn-filter" onClick={() => setIsFilterOpen(true)}><FaFilter /></button>
                <button type="button" className="btn-size">S</button>
                <button type="button" className="btn-size">M</button>
                <button type="button" className="btn-size">L</button>
                <button type="button" className="btn-size">XL</button>
                <button type="button" className="btn-size">XXL</button>
              </div>
            </div>
          </div>

          <div className="col-2">
            <div className="wardrobe">
              <button type="button" className="btn-left"><FaChevronLeft /></button>
              <div className="wardrobe-container">
                <div className="product-row">
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="product-row">
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="product-row">
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="product-card"
                    onClick={() => handleTShirtSelect(tshirt1)}>
                    <img src={tshirt1} width={100} alt="t-shirt" />
                    <div className="content">
                      <p className="product-name">Basic</p>
                      <p className="product-price">Rs. 4,000.00</p>
                      <div className="product-buttons">
                        <button className="btn-favorite" onClick={handleFavoriteClick}>
                          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>
                        <button className="btn-add-cart" onClick={handleAddToCartClick}>
                          {isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" className="btn-right"><FaChevronRight /></button>
            </div>
          </div>
        </div>
      </section >
    </div >
  );
}

export default App;