import { Router } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      bio,
      avatarUrl,
      city,
      country
    } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        error: "name, username, email e password são campos obrigatórios"
      })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return res.status(409).json({
        error: "Usuário com esse username ou email já existe"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        bio,
        avatarUrl,
        city,
        country
      }
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: "Erro ao criar usuário"
    });
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email e password são campos obrigatórios"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao realizar login"
    });
  }
});

export default router;