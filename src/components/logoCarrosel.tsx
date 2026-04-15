"use client";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";

const LogoCarrosel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600px - 960px

  const brands: string[] = [
    "/brands/logo_papelito.webp",
    "/brands/logo_larevolucion.webp",
    "/brands/logo_smoking_master.webp",
    "/brands/logo_cremaria.webp",
    "/brands/logo_bem_bolado.webp",
    "/brands/logo_tatu_do_bem.webp",
    "/brands/logo_aleda03.webp",
    "/brands/logo_to_na_be.webp",
  ];

  return (
    <Box
      sx={{
        width: "98vw",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "50px auto",
        paddingLeft: isMobile ? 2 : 6, // Padding lateral ajustado
        paddingRight: isMobile ? 2 : 6,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/brands/logo.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          opacity: 1,
          pointerEvents: "none",
          zIndex: 0,
        },
        "& .swiper": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      <Swiper
        spaceBetween={isMobile ? 20 : isTablet ? 40 : 50} // Ajusta espaço entre os logos conforme a tela
        slidesPerView={isMobile ? 3 : isTablet ? 4 : 5} // Mostra mais logos em telas médias
        loop={true}
        speed={5000}
        autoplay={{
          delay: 1,
          disableOnInteraction: false,
        }}
        freeMode={true}
        modules={[Autoplay]}
        style={{
          padding: "20px 0",
        }}
      >
        {brands.concat(brands).map((src, index) => (
          <SwiperSlide
            key={index}
            style={{
              width: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={src}
              alt={`Logo ${index}`}
              width={isMobile ? 80 : isTablet ? 120 : 100} // Ajusta tamanho da imagem
              height={isMobile ? 40 : isTablet ? 60 : 50}
              style={{ width: "auto", height: "auto" }} // Mantém proporção
              priority // Carregamento prioritário para evitar LCP delay
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default LogoCarrosel;
