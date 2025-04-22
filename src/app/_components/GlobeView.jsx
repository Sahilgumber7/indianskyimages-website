"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabase } from "@/lib/supabase";

export default function GlobeView() {
  const globeRef = useRef();
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase.from("images").select("*");
      if (error || !data) return;

      setImages(data);
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      // Create a scene and camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      globeRef.current.appendChild(renderer.domElement);

      // Create the Earth globe (sphere) using a texture
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const texture = new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const earth = new THREE.Mesh(geometry, material);
      scene.add(earth);

      // Camera position
      camera.position.z = 3;

      // Add circular image markers on the globe
      images.forEach((img) => {
        const lat = img.latitude;
        const lng = img.longitude;

        // Convert lat/lng to 3D coordinates
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        // Calculate the position on the globe
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        // Create the circle marker (image as texture)
        const circleGeometry = new THREE.CircleGeometry(0.05, 32);
        const imageTexture = new THREE.TextureLoader().load(img.image_url);
        const circleMaterial = new THREE.MeshBasicMaterial({ map: imageTexture, transparent: true, opacity: 1 });
        const marker = new THREE.Mesh(circleGeometry, circleMaterial);

        // Position the marker at the correct location on the globe
        marker.position.set(x, y, z);
        marker.lookAt(earth.position);  // Ensure marker faces outwards

        scene.add(marker);
      });

      // Animate the globe (auto-rotation)
      function animate() {
        requestAnimationFrame(animate);
        earth.rotation.y += 0.002; // Rotate the earth slowly
        renderer.render(scene, camera);
      }

      animate();
    }
  }, [images]);

  return <div ref={globeRef} className="absolute inset-0 z-0" />;
}
