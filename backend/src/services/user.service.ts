import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getAllUsersService = async () => {
    return await prisma.user.findMany();
};


export const createUserService = async (
    userData: {
        name: string;
        username: string;
        email: string;
        password: string;
        bio?: string;
        avatarUrl?: string;
        city?: string;
        country?: string;
    }) => {
    const { name, username, email, password, bio, avatarUrl, city, country } = userData;

    const existingUser = await prisma.user.findFirst({
        where: {
        OR: [
            { username },
            { email }
        ]
        }
    });

    if (existingUser) {
        throw new Error("Usuário com esse username ou email já existe");
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

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        createdAt: user.createdAt
    };
};

export const loginUserService = async ({
  email,
  password,
  rememberMe,
}: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Credenciais inválidas");
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    {
      expiresIn: rememberMe ? "30d" : "1d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt,
    },
  };
};

export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    city: user.city,
    country: user.country,
    createdAt: user.createdAt,
  };
};