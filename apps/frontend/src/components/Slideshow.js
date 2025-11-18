import { Box, Slide, Paper } from "@mui/material";
import { useState, useRef, useEffect } from "react";

export default function Slideshow(props) {
  const containerRef = useRef(null);
  const { imageList, timer } = props;
  const [index, setIndex] = useState(0);
  const [image, setImage] = useState({ new: imageList[0], old: imageList[0] });
  const [mount, setMount] = useState(false);

  setTimeout(() => {
    let i = index + 1;
    if (i >= imageList.length) i = 0;
    setImage({ new: imageList[i], old: imageList[index] });
    setIndex(i);

    setMount(!mount);
  }, timer);

  useEffect(() => {
    const preloadImages = () => {
      imageList.forEach((item) => {
        const img = new Image();
        img.src = item.img;
      });
    };

    preloadImages();
  }, [imageList]);

  return (
    <Paper
      elevation={20}
      sx={{
        height: "100%",
        width: "100%",
        borderRadius: 5,
        overflow: "hidden",
        position: "relative",
      }}
      ref={containerRef}
    >
      <Slide direction="left" in={mount} container={containerRef.current}>
        <Box
          component="img"
          sx={{
            position: "absolute",
            objectFit: "cover",
            width: "100%",
            height: "auto",
          }}
          alt={mount ? image.new.title : image.old.title}
          loading="eager"
          src={`${mount ? image.new.img : image.old.img}`}
        />
      </Slide>
      <Slide direction="left" in={!mount} container={containerRef.current}>
        <Box
          component="img"
          sx={{
            position: "absolute",
            objectFit: "cover",
            width: "100%",
            height: "auto",
          }}
          alt={!mount ? image.new.title : image.old.title}
          loading="eager"
          src={`${!mount ? image.new.img : image.old.img}`}
        />
      </Slide>
    </Paper>
  );
}
