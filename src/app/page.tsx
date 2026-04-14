"use client";
import CatalogoFireCloud from "@/components/catalogoFireCloud";
import LogoCarrosel from "@/components/logoCarrosel";
import ProdutosCatalogo, { Produto } from "@/components/produtosCatalogo";
import Sidebar from "@/components/Sidebar";
import SocialButtons from "@/components/SocialButtons";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { CATALOG_CATEGORIES, getCategoryLabel } from "@/lib/catalog";

interface CartItem extends Produto {
  id: string;
  categoria: string;
  quantidade: number;
}

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [formError, setFormError] = useState("");
  const whatsappNumber = "5511937701183";

  const parsePrice = (valor: string) => {
    const cleanedValue = valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
    return Number(cleanedValue) || 0;
  };

  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantidade, 0),
    [cartItems]
  );

  const totalValue = useMemo(
    () => cartItems.reduce((acc, item) => acc + parsePrice(item.preco) * item.quantidade, 0),
    [cartItems]
  );

  const handleAddToCart = (produto: Produto, categoria: string) => {
    const itemId = `${categoria}-${produto.nome}`;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }

      return [...prevItems, { ...produto, categoria, quantidade: 1, id: itemId }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantidade: nextQuantity } : item
      )
    );
  };

  const handleSendOrder = () => {
    if (!cartItems.length) {
      setFormError("Adicione pelo menos um item ao carrinho.");
      return;
    }
    if (!nome.trim() || !endereco.trim() || !pagamento.trim()) {
      setFormError("Preencha nome, endereço e forma de pagamento.");
      return;
    }

    const orderLines = cartItems.map(
      (item) =>
        `- ${item.nome} (${item.categoria}) x${item.quantidade} | ${item.preco}`
    );

    const message = [
      "Olá! Quero finalizar meu pedido:",
      "",
      "Itens:",
      ...orderLines,
      "",
      `Total: R$ ${totalValue.toFixed(2).replace(".", ",")}`,
      "",
      `Nome: ${nome}`,
      `Endereço: ${endereco}`,
      `Pagamento: ${pagamento}`,
      `Observações: ${observacoes || "Sem observações"}`,
    ].join("\n");

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setFormError("");
  };


  return (
    <Box mb={10}>
      <Sidebar />

      <CatalogoFireCloud />

      <SocialButtons 
        whatsapp="https://wa.me/5511937701183?text=Olá,%20gostaria%20de%20tirar%20algumas%20Duvidas!" 
        instagram="https://www.instagram.com/marrakechtab/"
        location=""
      />

      <LogoCarrosel />

      {CATALOG_CATEGORIES.map((category) => (
        <ProdutosCatalogo
          key={category.id}
          id={category.sectionId}
          categoriaId={category.id}
          categoria={getCategoryLabel(category)}
          jsonPath={category.jsonPath}
          onAddToCart={handleAddToCart}
        />
      ))}

      <Box
        sx={{
          position: "fixed",
          left: 16,
          bottom: 16,
          zIndex: 20,
        }}
      >
        <Badge badgeContent={totalItems} color="error">
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            sx={{ backgroundColor: "black", "&:hover": { backgroundColor: "#1f1f1f" } }}
            onClick={() => setIsCheckoutOpen(true)}
          >
            Comprar
          </Button>
        </Badge>
      </Box>

      <Dialog open={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Finalizar pedido</DialogTitle>
        <DialogContent>
          <List sx={{ mb: 2 }}>
            {cartItems.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 1,
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar
                    src={item.src}
                    alt={item.nome}
                    variant="rounded"
                    sx={{ width: 50, height: 50, flexShrink: 0 }}
                    imgProps={{ loading: "lazy" }}
                  />
                  <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
                    <Typography fontWeight="bold" noWrap>
                      {item.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.preco} | {item.categoria}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: "flex-end" }}>
                  <Button size="small" variant="outlined" onClick={() => handleUpdateQuantity(item.id, item.quantidade - 1)}>
                    -
                  </Button>
                  <Typography>{item.quantidade}</Typography>
                  <Button size="small" variant="outlined" onClick={() => handleUpdateQuantity(item.id, item.quantidade + 1)}>
                    +
                  </Button>
                  <IconButton color="error" onClick={() => handleRemoveFromCart(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                <Box sx={{ display: { xs: "block", sm: "none" } }}>
                  <Typography fontWeight="bold" variant="body2">
                    {item.nome}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.preco} | {item.categoria}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>

          <Typography fontWeight="bold" mb={2}>
            Total: R$ {totalValue.toFixed(2).replace(".", ",")}
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
            />
            <TextField
              label="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Forma de pagamento"
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
              fullWidth
            >
              <MenuItem value="Pix">Pix</MenuItem>
              <MenuItem value="Cartão na entrega">Cartão na entrega</MenuItem>
              <MenuItem value="Dinheiro">Dinheiro</MenuItem>
            </TextField>
            <TextField
              label="Observações"
              placeholder="Ex.: sem cebola, troco para 50, referência..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            {formError && (
              <Typography color="error" variant="body2">
                {formError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCheckoutOpen(false)}>Fechar</Button>
          <Button variant="contained" onClick={handleSendOrder}>
            Enviar no WhatsApp
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
