import { ObjectId } from "mongodb";

export const CATEGORIES = ["Mats", "Apparel", "Wellness", "Accessories"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductDocument {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  category: Category;
  stock: number;
  imageUrl: string;
  images: string[];
  rating: number;
  specs: Record<string, string>;
  reviews: Review[];
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}
