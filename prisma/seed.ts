import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";
import { calcularPrecioVenta } from "../lib/precio";

const prisma = new PrismaClient();

const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function saveSeedImage(filename: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), PIXEL_PNG);
  return `/uploads/${filename}`;
}

async function main() {
  const passwordHash = await hashPassword("Admin123!");

  const users = [
    {
      rut: "12345678-5",
      nombre: "Admin",
      apellido: "VentasFix",
      email: "admin@ventasfix.cl",
    },
    {
      rut: "11111111-1",
      nombre: "María",
      apellido: "Soto",
      email: "maria.soto@ventasfix.cl",
    },
    {
      rut: "22222222-2",
      nombre: "Pedro",
      apellido: "Díaz",
      email: "pedro.diaz@ventasfix.cl",
    },
    {
      rut: "33333333-3",
      nombre: "Clara",
      apellido: "Núñez",
      email: "clara.nunez@ventasfix.cl",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }

  const products = [
    {
      sku: "NB-14-001",
      nombre: "Notebook 14 pulgadas",
      descripcionCorta: "Portátil para oficina",
      descripcionLarga:
        "Notebook 14 pulgadas con 16 GB de RAM, SSD 512 GB y teclado en español.",
      precioNeto: 499990,
      stockActual: 12,
      stockMinimo: 3,
      stockBajo: 5,
      stockAlto: 40,
      imageFile: "nb-14-001.png",
    },
    {
      sku: "MOU-001",
      nombre: "Mouse inalámbrico",
      descripcionCorta: "Mouse ergonómico",
      descripcionLarga:
        "Mouse inalámbrico silencioso, receptor USB-C y batería recargable.",
      precioNeto: 12990,
      stockActual: 40,
      stockMinimo: 8,
      stockBajo: 12,
      stockAlto: 80,
      imageFile: "mou-001.png",
    },
    {
      sku: "TEC-001",
      nombre: "Teclado mecánico",
      descripcionCorta: "Teclado compacto",
      descripcionLarga:
        "Teclado mecánico 75% con switch táctil y cable USB-C desmontable.",
      precioNeto: 45990,
      stockActual: 18,
      stockMinimo: 4,
      stockBajo: 6,
      stockAlto: 50,
      imageFile: "tec-001.png",
    },
  ];

  for (const product of products) {
    const { imageFile, ...data } = product;
    const imagen = await saveSeedImage(imageFile);
    await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: {
        ...data,
        imagen,
        precioVenta: calcularPrecioVenta(data.precioNeto),
      },
    });
  }

  const clients = [
    {
      rutEmpresa: "76123456-0",
      rubro: "Tecnología",
      razonSocial: "Andes Soft SpA",
      telefono: "+56 2 2345 1001",
      direccion: "Av. Apoquindo 4500, Las Condes",
      nombreContacto: "Lucía Bravo",
      emailContacto: "compras@andessoft.cl",
    },
    {
      rutEmpresa: "77000001-7",
      rubro: "Logística",
      razonSocial: "Sur Distribución Ltda.",
      telefono: "+56 9 8765 4321",
      direccion: "Camino a Melipilla 1200, Santiago",
      nombreContacto: "Héctor Rivas",
      emailContacto: "contacto@surdist.cl",
    },
    {
      rutEmpresa: "78012345-1",
      rubro: "Retail",
      razonSocial: "Costa Pacífico S.A.",
      telefono: "+56 32 211 7788",
      direccion: "Av. Argentina 540, Valparaíso",
      nombreContacto: "Pamela Fuentes",
      emailContacto: "pamela.fuentes@costapacifico.cl",
    },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { rutEmpresa: client.rutEmpresa },
      update: {},
      create: client,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
