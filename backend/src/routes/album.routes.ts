import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:id/rating", async (req, res) => {
    const { id } = req.params;

    const result = await prisma.review.aggregate({
        where: {
            album: { externalId: id }
        },
        _avg: { rating: true },
        _count: { _all: true }
    });

    const average = result._avg.rating;

    res.json({
        data: {
            albumId: id,
            averageRating: average === null ? null : Math.round(Number(average) * 10) / 10,
            ratingsCount: result._count._all
        }
    });
});

// Só avaliações com texto (resenhas), das mais recentes para as mais antigas.
router.get("/:id/reviews", async (req, res) => {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
        where: {
            album: { externalId: id },
            content: { not: null },
            NOT: { content: "" }
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            user: {
                select: { id: true, name: true, username: true, avatarUrl: true }
            }
        }
    });

    res.json({
        data: reviews.map((review) => ({
            ...review,
            rating: Number(review.rating)
        }))
    });
});

export default router;