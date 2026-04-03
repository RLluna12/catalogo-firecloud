import Image from "next/image";
import { Box } from "@mui/material";

const CatalogoFireCloud = () => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        py: { xs: 2, sm: 2.5, md: 3 },
        mb: { xs: 1, md: 2 },
      }}
    >
      <Image
        src="/brands/Logo.jpg"
        alt="Descrição da imagem"
        width={420}
        height={140}
        sizes="(max-width: 600px) 65vw, (max-width: 960px) 45vw, 320px"
        style={{
          display: "block",
          width: "clamp(180px, 32vw, 320px)",
          height: "auto",
        }}
        priority
      />
    </Box>
  );
};

export default CatalogoFireCloud;
