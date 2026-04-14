"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { Session } from "@supabase/supabase-js";
import { CATALOG_CATEGORIES, getCategoryLabel } from "@/lib/catalog";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

interface ProductRow {
  id: number;
  nome: string;
  preco: string;
  src: string;
  categoria: string;
}

const emptyForm = {
  nome: "",
  preco: "",
  src: "",
};

export default function AdminPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATALOG_CATEGORIES[0].id);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const resetMessages = () => {
    setMessage("");
    setErrorMessage("");
  };

  const loadProducts = useCallback(async () => {
    if (!supabase || !session) {
      return;
    }

    setLoadingProducts(true);
    resetMessages();

    const { data, error } = await supabase
      .from("produtos")
      .select("id, nome, preco, src, categoria")
      .eq("categoria", selectedCategory)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setProducts([]);
    } else {
      setProducts(data ?? []);
    }

    setLoadingProducts(false);
  }, [selectedCategory, session, supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    setAuthLoading(true);
    resetMessages();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setMessage("Login efetuado com sucesso.");
      setEmail("");
      setPassword("");
    }

    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setProducts([]);
    setForm(emptyForm);
    setEditingId(null);
  };

  const validateForm = () => {
    if (!form.nome.trim() || !form.preco.trim() || !form.src.trim()) {
      setErrorMessage("Preencha nome, preco e URL/caminho da imagem.");
      return false;
    }
    return true;
  };

  const handleCreateOrUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !session || !validateForm()) {
      return;
    }

    resetMessages();

    const payload = {
      nome: form.nome.trim(),
      preco: form.preco.trim(),
      src: form.src.trim(),
      categoria: selectedCategory,
    };

    if (editingId) {
      const { error } = await supabase.from("produtos").update(payload).eq("id", editingId);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage("Produto atualizado com sucesso.");
    } else {
      const { error } = await supabase.from("produtos").insert(payload);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage("Produto criado com sucesso.");
    }

    setForm(emptyForm);
    setEditingId(null);
    loadProducts();
  };

  const handleDelete = async (id: number) => {
    if (!supabase || !session) {
      return;
    }

    const confirmed = window.confirm("Deseja remover este produto?");
    if (!confirmed) {
      return;
    }

    resetMessages();

    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Produto removido com sucesso.");
    loadProducts();
  };

  const startEditing = (product: ProductRow) => {
    setEditingId(product.id);
    setForm({ nome: product.nome, preco: product.preco, src: product.src });
  };

  if (!supabase) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning">
          Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar o Admin.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Button component={Link} href="/" startIcon={<ArrowBackIcon />}>
          Voltar ao catalogo
        </Button>
        {session && (
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        )}
      </Stack>

      <Typography variant="h4" fontWeight="bold" mb={2}>
        Painel Admin
      </Typography>

      {message && (
        <Alert sx={{ mb: 2 }} severity="success">
          {message}
        </Alert>
      )}
      {errorMessage && (
        <Alert sx={{ mb: 2 }} severity="error">
          {errorMessage}
        </Alert>
      )}

      {!session ? (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Login do administrador
            </Typography>
            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" disabled={authLoading}>
                  Entrar
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Cadastrar ou editar produto
              </Typography>
              <Stack spacing={2} component="form" onSubmit={handleCreateOrUpdate}>
                <TextField
                  select
                  label="Categoria"
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  fullWidth
                >
                  {CATALOG_CATEGORIES.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {getCategoryLabel(category)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Nome"
                  value={form.nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label="Preco"
                  placeholder="R$ 35,00"
                  value={form.preco}
                  onChange={(event) => setForm((prev) => ({ ...prev, preco: event.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label="Imagem"
                  placeholder="/products/cuias/cuia.png"
                  value={form.src}
                  onChange={(event) => setForm((prev) => ({ ...prev, src: event.target.value }))}
                  fullWidth
                  required
                />

                <Stack direction="row" spacing={1}>
                  <Button variant="contained" type="submit">
                    {editingId ? "Salvar alteracoes" : "Adicionar produto"}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                    >
                      Cancelar edicao
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="h6" mb={1}>
            Produtos da categoria selecionada
          </Typography>

          {loadingProducts ? (
            <Typography>Carregando...</Typography>
          ) : (
            <Stack spacing={1.5}>
              {products.map((product) => (
                <Card key={product.id} variant="outlined">
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Box>
                        <Typography fontWeight="bold">{product.nome}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.preco}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.src}
                        </Typography>
                      </Box>

                      <Stack direction="row">
                        <IconButton onClick={() => startEditing(product)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(product.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}

              {!products.length && (
                <Typography color="text.secondary">
                  Nenhum produto cadastrado nessa categoria.
                </Typography>
              )}
            </Stack>
          )}
        </>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="body2" color="text.secondary">
        Dica: os produtos do catalogo principal passam a ser lidos do Supabase. Se a conexao falhar,
        o site usa os arquivos JSON como fallback automatico.
      </Typography>
    </Container>
  );
}
