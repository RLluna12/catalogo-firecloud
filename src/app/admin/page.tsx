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
  descricao: string;
  preco: string;
  src: string;
  categoria: string;
}

const emptyForm = {
  nome: "",
  descricao: "",
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
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
      .select("id, nome, descricao, preco, src, categoria")
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

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    setImagePreview(form.src.trim());
  }, [form.src, imageFile]);

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
    setImageFile(null);
    setEditingId(null);
  };

  const validateForm = () => {
    if (!form.nome.trim() || !form.preco.trim()) {
      setErrorMessage("Preencha nome e preço.");
      return false;
    }

    if (!form.src.trim() && !imageFile) {
      setErrorMessage("Informe a imagem por upload ou URL.");
      return false;
    }

    return true;
  };

  const uploadProductImage = async () => {
    if (!supabase || !session || !imageFile) {
      return form.src.trim();
    }

    setUploadingImage(true);

    const fileExt = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const sanitizedName = imageFile.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "produto";
    const filePath = `${selectedCategory}/${Date.now()}-${session.user.id}-${sanitizedName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("produtos")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploadingImage(false);
      throw uploadError;
    }

    const { data } = supabase.storage.from("produtos").getPublicUrl(filePath);
    setUploadingImage(false);

    return data.publicUrl;
  };

  const handleCreateOrUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !session || !validateForm()) {
      return;
    }

    resetMessages();

    let imageSrc = form.src.trim();

    try {
      if (imageFile) {
        imageSrc = await uploadProductImage();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao enviar a imagem.");
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      preco: form.preco.trim(),
      src: imageSrc,
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
    setImageFile(null);
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
    setForm({ nome: product.nome, descricao: product.descricao, preco: product.preco, src: product.src });
    setImageFile(null);
  };

  if (!supabase) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "rgba(24, 6, 6, 0.56)", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="sm">
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            O painel administrativo ainda nao foi configurado corretamente.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "rgba(24, 6, 6, 0.62)", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            borderRadius: 5,
            bgcolor: "rgba(255, 249, 246, 0.92)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(14px)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 3, md: 5 },
              py: { xs: 3, md: 4 },
              background: "linear-gradient(135deg, rgba(103, 12, 12, 0.95), rgba(38, 6, 6, 0.95))",
              color: "white",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 2.2, opacity: 0.8 }}>
                  Painel da loja
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: 34, md: 42 } }}>
                  Gerenciar produtos
                </Typography>
                <Typography sx={{ maxWidth: 620, opacity: 0.86, mt: 1 }}>
                  Adicione, edite ou remova produtos de forma simples. Basta preencher os dados e escolher a foto do item.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Button
                  component={Link}
                  href="/"
                  startIcon={<ArrowBackIcon />}
                  variant="outlined"
                  sx={{ borderColor: "rgba(255,255,255,0.35)", color: "white" }}
                >
                  Voltar ao catalogo
                </Button>
                {session && (
                  <Button
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ color: "white", borderColor: "rgba(255,255,255,0.35)" }}
                    variant="outlined"
                  >
                    Sair
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
            {message && (
              <Alert sx={{ mb: 2.5, borderRadius: 3 }} severity="success">
                {message}
              </Alert>
            )}
            {errorMessage && (
              <Alert sx={{ mb: 2.5, borderRadius: 3 }} severity="error">
                {errorMessage}
              </Alert>
            )}

            {!session ? (
              <Card sx={{ maxWidth: 520, mx: "auto", borderRadius: 4, boxShadow: "0 18px 50px rgba(0, 0, 0, 0.12)" }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" fontWeight={700} mb={1}>
                    Entrar no painel
                  </Typography>
                  <Typography color="text.secondary" mb={3}>
                    Use o e-mail e a senha informados para acessar a area de cadastro.
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
                      <Button type="submit" variant="contained" disabled={authLoading} sx={{ py: 1.4 }}>
                        {authLoading ? "Entrando..." : "Entrar"}
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card sx={{ mb: 3, borderRadius: 4, boxShadow: "0 18px 50px rgba(0, 0, 0, 0.12)" }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Typography variant="h5" fontWeight={700} mb={0.5}>
                      {editingId ? "Editar produto" : "Novo produto"}
                    </Typography>
                    <Typography color="text.secondary" mb={3}>
                      Preencha as informacoes abaixo e escolha a foto do produto.
                    </Typography>
                    <Stack spacing={2.5} component="form" onSubmit={handleCreateOrUpdate}>
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
                  label="Descrição"
                  value={form.descricao}
                  onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Preço"
                  placeholder="R$ 35,00"
                  value={form.preco}
                  onChange={(event) => setForm((prev) => ({ ...prev, preco: event.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label="Imagem"
                  placeholder="https://... ou /products/cuias/cuia.png"
                  value={form.src}
                  onChange={(event) => setForm((prev) => ({ ...prev, src: event.target.value }))}
                  fullWidth
                />
                      <Box
                        sx={{
                          border: "1px dashed rgba(120, 27, 27, 0.35)",
                          borderRadius: 3,
                          p: 2,
                          bgcolor: "rgba(120, 27, 27, 0.03)",
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Button component="label" variant="outlined" disabled={uploadingImage} sx={{ alignSelf: "flex-start" }}>
                            {imageFile ? "Trocar imagem" : "Escolher imagem"}
                            <input
                              hidden
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                const nextFile = event.target.files?.[0] ?? null;
                                setImageFile(nextFile);
                              }}
                            />
                          </Button>

                          <Typography variant="body2" color="text.secondary">
                            Escolha uma foto do produto no seu computador ou, se preferir, cole um link no campo acima.
                          </Typography>

                          {imageFile && (
                            <Typography variant="body2" fontWeight={600}>
                              Arquivo selecionado: {imageFile.name}
                            </Typography>
                          )}

                          {imagePreview && (
                            <Box
                              component="img"
                              src={imagePreview}
                              alt="Previa da imagem do produto"
                              sx={{
                                width: 160,
                                height: 160,
                                objectFit: "cover",
                                borderRadius: 3,
                                border: "1px solid rgba(0,0,0,0.08)",
                                bgcolor: "white",
                              }}
                            />
                          )}
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="contained" type="submit" disabled={uploadingImage} sx={{ minWidth: 190, py: 1.3 }}>
                          {uploadingImage
                            ? "Enviando imagem..."
                            : editingId
                              ? "Salvar alteracoes"
                              : "Adicionar produto"}
                        </Button>
                  {editingId && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingId(null);
                            setForm(emptyForm);
                            setImageFile(null);
                          }}
                          sx={{ minWidth: 170, py: 1.3 }}
                        >
                          Cancelar edicao
                        </Button>
                  )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, boxShadow: "0 18px 50px rgba(0, 0, 0, 0.12)" }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Typography variant="h5" fontWeight={700} mb={0.5}>
                      Produtos da categoria selecionada
                    </Typography>
                    <Typography color="text.secondary" mb={2.5}>
                      Clique no lapis para editar ou na lixeira para remover um item.
                    </Typography>

                    {loadingProducts ? (
                      <Typography>Carregando...</Typography>
                    ) : (
                      <Stack spacing={1.5}>
              {products.map((product) => (
                <Card key={product.id} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={2}
                    >
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Box
                          component="img"
                          src={product.src}
                          alt={product.nome}
                          sx={{
                            width: 84,
                            height: 84,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid rgba(0,0,0,0.08)",
                            bgcolor: "#fff",
                          }}
                        />
                        <Box>
                          <Typography fontWeight="bold">{product.nome}</Typography>
                        {product.descricao && (
                          <Typography variant="body2" color="text.secondary">
                            {product.descricao}
                          </Typography>
                        )}
                        <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                          {product.preco}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Imagem cadastrada
                        </Typography>
                        </Box>
                      </Stack>

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
                  </CardContent>
                </Card>
              </>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" color="text.secondary">
              Dica: depois de salvar, o produto ja aparece no catalogo principal automaticamente.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
