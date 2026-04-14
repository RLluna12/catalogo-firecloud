import Image from "next/image";

const CatalogoFireCloud = () => {
  return (
    <Image
      src="/brands/logo.png"
      alt="Descrição da imagem"
      width={520 }
      height={200}
      sizes="(max-width: 600px) 65vw, (max-width: 960px) 45vw, 320px"
      style={{
        display: "block", // Garante que a imagem possa ser centralizada corretamente
        margin: "auto", // Centraliza horizontalmente
        width: "clamp(180px, 32vw, 320px)", // Evita que a logo fique exagerada no desktop
        height: "auto", // Mantém a proporção da altura
      }}
      priority // Carregamento prioritário para melhorar o LCP
    />
  );
};

export default CatalogoFireCloud;
