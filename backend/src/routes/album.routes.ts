import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:id/rating", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await prisma.review.aggregate({
            where: {
                album: { externalId: id }
            },
            _avg: { rating: true },
            _count: { _all: true }
        });

        const average = result._avg.rating || 0;

        return res.status(200).json({
            albumId: id,
            averageRating: average === null ? null : Math.round(Number(average) * 10) / 10,
            ratingsCount: result._count._all
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: "Erro ao calcular média do álbum" 
        });
    }
});

export default router;