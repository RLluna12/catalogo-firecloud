# 🛍️ Fire Cloud - Catálogo Digital

**Fire Cloud** é um catálogo digital desenvolvido com **Next.js**, **TypeScript**, **MUI** e **Tailwind CSS**, proporcionando uma experiência moderna e responsiva para exibição de produtos de uma tabacaria.

---

## 🚀 Tecnologias Utilizadas
- **Next.js** - Framework React para SSR e otimização
- **TypeScript** - Tipagem estática para melhor manutenção do código
- **MUI (Material-UI)** - Biblioteca de componentes estilizados
- **Tailwind CSS** - Estilização rápida e flexível
- **Swiper.js** - Carrossel dinâmico para exibição de produtos

---

## 📌 Funcionalidades
✔️ Catálogo de produtos atualizado  
✔️ Navegação fluída e otimizada  
✔️ Carrossel de imagens interativo  
✔️ Design responsivo para mobile e desktop  
✔️ Painel Admin com Supabase para adicionar, editar e remover produtos

---

## 🔐 Admin com Supabase

### 1. Instale e configure as variáveis

Crie um arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

### 2. Crie a tabela no SQL Editor do Supabase

```sql
create table if not exists public.produtos (
	id bigint generated always as identity primary key,
	nome text not null,
	preco text not null,
	src text not null,
	categoria text not null,
	created_at timestamptz not null default now()
);

alter table public.produtos enable row level security;

create policy "Public can read produtos"
on public.produtos
for select
to public
using (true);

create policy "Authenticated can insert produtos"
on public.produtos
for insert
to authenticated
with check (true);

create policy "Authenticated can update produtos"
on public.produtos
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated can delete produtos"
on public.produtos
for delete
to authenticated
using (true);
```

### 3. Crie um usuario administrador

No Supabase, acesse Authentication > Users e crie um usuario com email e senha.

### 4. Use o painel

- Rota do admin: `/admin`
- O catalogo publico le do Supabase.
- Se o Supabase nao estiver configurado, os produtos continuam sendo carregados dos JSONs em `public/json`.