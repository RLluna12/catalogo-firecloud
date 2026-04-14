"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export interface Produto {
  src: string;
  nome: string;
  preco: string;
}

const formatPriceBRL = (price: string) => {
  const normalized = price.trim();
  return normalized.toLowerCase().startsWith("r$") ? normalized : `R$ ${normalized}`;
};

interface ProdutosCatalogoProps {
  jsonPath: string;
  categoria: string;
  categoriaId: string;
  id: string;
  onAddToCart: (produto: Produto, categoria: string) => void;
}

export default function ProdutosCatalogo({
  jsonPath,
  categoria,
  categoriaId,
  id,
  onAddToCart,
}: ProdutosCatalogoProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        const { data, error } = await supabase
          .from("produtos")
          .select("nome, preco, src")
          .eq("categoria", categoriaId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setProdutos(data);
          return;
        }
      }

      fetch(jsonPath)
        .then((res) => res.json())
        .then((data) => setProdutos(data))
        .catch(() => setProdutos([]));
    };

    loadProducts();
  }, [jsonPath, categoriaId]);

  return (
    <Paper
      id={id}
      elevation={3}
      sx={{
        p: isMobile ? 2 : isTablet ? 3 : 4,
        maxWidth: isMobile ? "100%" : isTablet ? "90%" : "1200px",
        mx: isMobile ? 2 : isTablet ? 10 : "auto",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        marginBottom: 3,
      }}
    >
      {/* Título da categoria */}
      <Box
        sx={{
          position: "absolute",
          top: isMobile ? 12 : 16,
          left: 0,
          backgroundColor: "black",
          px: isMobile ? 1.5 : 2,
          py: 1,
          borderRadius: "0 10px 10px 0",
          zIndex: 1,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : isTablet ? "h4" : "h3"}
          fontSize={isMobile ? 16 : isTablet ? 20 : 25}
          fontWeight="bold"
          color="white"
        >
          {categoria}
        </Typography>
      </Box>

      {/* Espaçamento extra para evitar sobreposição do título */}
      <Box sx={{ mt: isMobile ? 8 : isTablet ? 10 : 12 }}>
        <Grid container spacing={isMobile ? 2 : isTablet ? 3 : 4}>
          {produtos.map((produto, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: isMobile ? 2 : isTablet ? 2.5 : 3,
                  minHeight: isMobile ? 250 : isTablet ? 280 : 350,
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    ...(isDesktop
                      ? { transform: "scale(1.05)", boxShadow: 6 }
                      : {}),
                  },
                }}
              >
                {/* Imagem do produto com fallback */}
                <Box
                  sx={{
                    position: "relative",
                    width: isMobile ? 120 : isTablet ? 140 : 170,
                    height: isMobile ? 120 : isTablet ? 140 : 170,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 0.5,
                  }}
                >
                  <Image
                    src={produto.src}
                    alt={produto.nome}
                    fill
                    sizes={isMobile ? "120px" : isTablet ? "140px" : "170px"}
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/unavailable.webp";
                    }}
                  />
                </Box>

                <CardContent sx={{ textAlign: "center", width: "100%" }}>
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    fontWeight="medium"
                  >
                    {produto.nome}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="primary"
                    fontWeight="bold"
                    mt={1}
                  >
                    {formatPriceBRL(produto.preco)}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    size={isMobile ? "small" : "medium"}
                    sx={{ mt: 1.5, backgroundColor: "black", "&:hover": { backgroundColor: "#1f1f1f" } }}
                    onClick={() => onAddToCart(produto, categoria)}
                  >
                    Adicionar ao carrinho
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}
