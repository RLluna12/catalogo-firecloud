"use client";

import { useState } from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { Menu, Backpack, RiceBowl, Receipt, SmokingRoomsRounded, ContentCut, Whatshot, Delete, KeyboardArrowRight } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const highlightSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.style.border = "3px solid red";
      setTimeout(() => {
        section.style.border = "none";
      }, 2000); // Remove o destaque após 2 segundos
    }
  };


  // Função para rolar até a seção específica
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" }); // Faz a rolagem suave
      highlightSection(id);
      setOpen(false); // Fecha a Sidebar após clicar
    }
  };
  const botões =
    [
      { text: "Para Armazenar", icon: <Backpack />, id: "armazenar" },
      { text: "Cuias", icon: <RiceBowl />, id: "cuias" },
      { text: "Sedas", icon: <Receipt />, id: "sedas" },
      { text: "Piteiras", icon: <SmokingRoomsRounded />, id: "piteiras" },
      { text: "Tesouras", icon: <ContentCut />, id: "tesouras" },
      { text: "Isqueiros", icon: <Whatshot />, id: "isqueiros" },
      { text: "Cinzeiros", icon: <Delete />, id: "cinzeiros" },
      { text: "Bandejas", icon: <KeyboardArrowRight />, id: "bandejas" },
      { text: "Tabaco", icon: <SmokingRoomsRounded />, id: "tabaco" },
      { text: "Slicks", icon: <Backpack />, id: "slicks" },
    ]

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

          {/* Itens da Sidebar */}
          {botões.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={() => scrollToSection(item.id)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
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
