"use client";

import { useEffect, useState } from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { Menu, Backpack, RiceBowl, Receipt, SmokingRoomsRounded, ContentCut, Whatshot, Delete, KeyboardArrowRight, Inventory, LocalOffer, Star } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

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

const FALLBACK_ITEMS = [
  { text: "Para Armazenar", icon_name: "Backpack", section_id: "armazenar", emoji: "" },
  { text: "Cuias", icon_name: "RiceBowl", section_id: "cuias", emoji: "" },
  { text: "Sedas", icon_name: "Receipt", section_id: "sedas", emoji: "" },
  { text: "Piteiras", icon_name: "SmokingRooms", section_id: "piteiras", emoji: "" },
  { text: "Tesouras", icon_name: "ContentCut", section_id: "tesouras", emoji: "" },
  { text: "Isqueiros", icon_name: "Whatshot", section_id: "isqueiros", emoji: "" },
  { text: "Cinzeiros", icon_name: "Delete", section_id: "cinzeiros", emoji: "" },
  { text: "Bandejas", icon_name: "KeyboardArrowRight", section_id: "bandejas", emoji: "" },
  { text: "Tabaco", icon_name: "SmokingRooms", section_id: "tabaco", emoji: "" },
  { text: "Slicks", icon_name: "Backpack", section_id: "slicks", emoji: "" },
];

interface SidebarItem {
  text: string;
  icon_name: string;
  section_id: string;
  emoji: string;
}

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
        if (data && data.length > 0) setItems(data);
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
