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

export default router;