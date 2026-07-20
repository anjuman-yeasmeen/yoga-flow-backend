import { Router, Request, Response } from "express";
import { ObjectId, Filter, Sort, WithId } from "mongodb";
import { db } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { CATEGORIES, Category, ProductDocument } from "../types/product.js";

const router = Router();
const products = () => db.collection<ProductDocument>("products");

function serialize(doc: WithId<ProductDocument>) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

const SORT_OPTIONS: Record<string, Sort> = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "rating-desc": { rating: -1 },
  "title-asc": { title: 1 },
};

// GET /api/products — search, filter, sort, paginate
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      sort = "newest",
      page = "1",
      limit = "8",
    } = req.query as Record<string, string>;

    const filter: Filter<ProductDocument> = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { shortDescription: regex }, { description: regex }];
    }
    if (category && (CATEGORIES as readonly string[]).includes(category)) {
      filter.category = category as Category;
    }
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (minPrice !== "" && !Number.isNaN(min)) {
      filter.price = { ...(filter.price as object), $gte: min };
    }
    if (maxPrice !== "" && !Number.isNaN(max)) {
      filter.price = { ...(filter.price as object), $lte: max };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 8));
    const sortSpec = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;

    const [total, docs] = await Promise.all([
      products().countDocuments(filter),
      products()
        .find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .toArray(),
    ]);

    res.json({
      success: true,
      data: docs.map(serialize),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (error) {
    console.error("GET /api/products failed:", error);
    res.status(500).json({ success: false, message: "Failed to load products." });
  }
});

// GET /api/products/:id — details + related items
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid product id." });
      return;
    }

    const doc = await products().findOne({ _id: new ObjectId(id) });
    if (!doc) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    const related = await products()
      .find({ category: doc.category, _id: { $ne: doc._id } })
      .sort({ rating: -1 })
      .limit(4)
      .toArray();

    res.json({
      success: true,
      data: serialize(doc),
      related: related.map(serialize),
    });
  } catch (error) {
    console.error("GET /api/products/:id failed:", error);
    res.status(500).json({ success: false, message: "Failed to load product." });
  }
});

// POST /api/products — protected
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, shortDescription, description, price, category, stock, imageUrl } =
      req.body ?? {};

    const errors: string[] = [];
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      errors.push("Title must be at least 3 characters.");
    }
    if (!shortDescription || typeof shortDescription !== "string" || shortDescription.trim().length < 10) {
      errors.push("Short description must be at least 10 characters.");
    }
    if (!description || typeof description !== "string" || description.trim().length < 30) {
      errors.push("Full description must be at least 30 characters.");
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      errors.push("Price must be a positive number.");
    }
    if (!(CATEGORIES as readonly string[]).includes(category)) {
      errors.push(`Category must be one of: ${CATEGORIES.join(", ")}.`);
    }
    const stockNum = Number(stock ?? 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      errors.push("Stock must be zero or a positive number.");
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, message: errors.join(" "), errors });
      return;
    }

    const fallbackImage =
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop";
    const image =
      typeof imageUrl === "string" && imageUrl.trim().startsWith("http")
        ? imageUrl.trim()
        : fallbackImage;

    const doc: ProductDocument = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      price: Math.round(priceNum * 100) / 100,
      category: category as Category,
      stock: Math.floor(stockNum),
      imageUrl: image,
      images: [image],
      rating: 0,
      specs: {},
      reviews: [],
      createdBy: req.user!.id,
      createdByName: req.user!.name,
      createdAt: new Date(),
    };

    const result = await products().insertOne(doc);
    res.status(201).json({
      success: true,
      message: "Product added successfully.",
      data: serialize({ ...doc, _id: result.insertedId }),
    });
  } catch (error) {
    console.error("POST /api/products failed:", error);
    res.status(500).json({ success: false, message: "Failed to add product." });
  }
});

// DELETE /api/products/:id — protected (owner or admin)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid product id." });
      return;
    }

    const doc = await products().findOne({ _id: new ObjectId(id) });
    if (!doc) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    const isAdmin = req.user!.role === "admin";
    const isOwner = doc.createdBy === req.user!.id;
    if (!isAdmin && !isOwner) {
      res.status(403).json({
        success: false,
        message: "You can only delete products you added. Admins can delete any product.",
      });
      return;
    }

    await products().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/products/:id failed:", error);
    res.status(500).json({ success: false, message: "Failed to delete product." });
  }
});

export default router;
