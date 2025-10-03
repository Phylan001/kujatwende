import type { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  role: "user" | "admin";
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  phone: string;
}
