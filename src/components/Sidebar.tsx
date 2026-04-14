"use client";

import { useEffect, useState } from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { Menu, Backpack, RiceBowl, Receipt, SmokingRoomsRounded, ContentCut, Whatshot, Delete, KeyboardArrowRight, Inventory, LocalOffer, Star } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { CATALOG_CATEGORIES } from "@/lib/catalog";

const ICON_MAP: Record<string, React.ReactNode> = {
  Backpack: <Backpack />,
  RiceBowl: <RiceBowl />,
  Receipt: <Receipt />,
  SmokingRooms: <SmokingRoomsRounded />,
  ContentCut: <ContentCut />,
  Whatshot: <Whatshot />,
  Delete: <Delete />,
  KeyboardArrowRight: <KeyboardArrowRight />,
  Inventory: <Inventory />,
  LocalOffer: <LocalOffer />,
  Star: <Star />,
};

const DEFAULT_ICON_BY_SECTION: Record<string, string> = {
  armazenar: "Backpack",
  cuias: "RiceBowl",
  sedas: "Receipt",
  piteiras: "SmokingRooms",
  tesouras: "ContentCut",
  isqueiros: "Whatshot",
  cinzeiros: "Delete",
  bandejas: "KeyboardArrowRight",
  tabaco: "SmokingRooms",
  slicks: "Backpack",
};

const CATALOG_BY_SECTION = Object.fromEntries(
  CATALOG_CATEGORIES.map((category) => [category.sectionId, category])
);

const FALLBACK_ITEMS = CATALOG_CATEGORIES.map((category) => ({
  text: category.title,
  icon_name: DEFAULT_ICON_BY_SECTION[category.sectionId] ?? "KeyboardArrowRight",
  section_id: category.sectionId,
  emoji: category.emoji,
}));

interface SidebarItem {
  text: string;
  icon_name: string;
  section_id: string;
  emoji: string;
}

const normalizeSidebarItems = (items: SidebarItem[]) => {
  const normalized = items.map((item) => {
    const catalogCategory = CATALOG_BY_SECTION[item.section_id];

    return {
      ...item,
      text: catalogCategory?.title ?? item.text,
      emoji: catalogCategory?.emoji ?? item.emoji,
      icon_name: item.icon_name || DEFAULT_ICON_BY_SECTION[item.section_id] || "KeyboardArrowRight",
    };
  });

  const seenSections = new Set(normalized.map((item) => item.section_id));
  const missingItems = FALLBACK_ITEMS.filter((item) => !seenSections.has(item.section_id));

  return [...normalized, ...missingItems];
};

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SidebarItem[]>(FALLBACK_ITEMS);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("categorias")
      .select("text, section_id, icon_name, emoji, ordem")
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(normalizeSidebarItems(data));
          return;
        }

        setItems(normalizeSidebarItems(FALLBACK_ITEMS));
      });
  }, []);

  const highlightSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.style.border = "3px solid red";
      setTimeout(() => {
        section.style.border = "none";
      }, 2000);
    }
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      highlightSection(id);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Botão de Menu */}
      <IconButton onClick={() => setOpen(true)} sx={
        {
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
          backgroundColor: 'black',
          color: 'white',
          borderRadius: '0 0 20px 0',
          transition: "background-color 0.3s ease",
          ":hover": {
            backgroundColor: '#181818'
          }
        }}>
        <Menu fontSize="large" />
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 250 }}>
          <ListItem>
            <ListItemText primary="Menu" sx={{ fontWeight: "bold", textAlign: "center" }} />
          </ListItem>

          {items.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={() => scrollToSection(item.section_id)}>
                <ListItemIcon>{ICON_MAP[item.icon_name] ?? <KeyboardArrowRight />}</ListItemIcon>
                <ListItemText primary={item.emoji ? `${item.emoji} ${item.text}` : item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding>
            <ListItemButton component={Link} href="/admin" onClick={() => setOpen(false)}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
