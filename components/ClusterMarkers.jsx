"use client";

import { useState, useEffect, useMemo } from "react";
import Supercluster from "supercluster";
import { useMap } from "react-leaflet";
import ClusterMarker from "./ClusterMarker";
import ImageMarker from "./ImageMarker";

export default function ClusterMarkers({ images }) {
  const map = useMap();
  const [mapState, setMapState] = useState({
    zoom: map.getZoom(),
    bounds: map.getBounds(),
  });

  // Update map bounds & zoom on move/zoom
  useEffect(() => {
    const onMove = () =>
      setMapState({ zoom: map.getZoom(), bounds: map.getBounds() });
    map.on("moveend", onMove);
    return () => map.off("moveend", onMove);
  }, [map]);

  // Convert images to GeoJSON points
  const points = useMemo(
    () =>
      images.map((img) => ({
        type: "Feature",
        properties: { cluster: false, img },
        geometry: {
          type: "Point",
          coordinates: [parseFloat(img.longitude), parseFloat(img.latitude)],
        },
      })),
    [images]
  );

  // Only create Supercluster once
  const supercluster = useMemo(() => {
    const sc = new Supercluster({ radius: 60, maxZoom: 18 });
    sc.load(points);
    return sc;
  }, [points]);

  // Only get clusters in current bounds
  const clusters = useMemo(() => {
    if (!mapState.bounds) return [];
    const bounds = [
      mapState.bounds.getWest(),
      mapState.bounds.getSouth(),
      mapState.bounds.getEast(),
      mapState.bounds.getNorth(),
    ];
    return supercluster.getClusters(bounds, mapState.zoom);
  }, [supercluster, mapState]);

  return (
    <>
      {clusters.map((cluster) =>
        cluster.properties.cluster ? (
          <ClusterMarker
            key={`cluster-${cluster.id}`}
            cluster={cluster}
            supercluster={supercluster}
            map={map}
          />
        ) : (
          <ImageMarker
            key={cluster.properties.img._id}
            img={cluster.properties.img}
            small // Pass prop to render thumbnail instead of full image
          />
        )
      )}
    </>
  );
}
