import { pgTable, text, serial, timestamp, boolean, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  permissions: text("permissions").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  plate: text("plate").notNull().unique(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cnh: text("cnh").notNull().unique(),
  phone: text("phone"),
  active: boolean("active").notNull().default(true),
});

export const refuelings = pgTable("refuelings", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  driverId: integer("driver_id").notNull(),
  date: timestamp("date").notNull(),
  liters: decimal("liters", { precision: 10, scale: 2 }).notNull(),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  odometer: integer("odometer"),
});

export const refrigeration = pgTable("refrigeration", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  active: boolean("active").notNull().default(true),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  active: boolean("active").notNull().default(true),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  name: z.string(),
  role: z.string(),
  permissions: z.array(z.string()).optional().default([]),
  active: z.boolean().optional().default(true),
});

export const insertVehicleSchema = z.object({
  plate: z.string(),
  model: z.string(),
  year: z.coerce.number(),
  type: z.string(),
  status: z.string().optional().default("active"),
});

export const insertDriverSchema = z.object({
  name: z.string(),
  cnh: z.string(),
  phone: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
});

export const insertRefuelingSchema = z.object({
  vehicleId: z.coerce.number(),
  driverId: z.coerce.number(),
  date: z.coerce.date(),
  liters: z.string(),
  pricePerLiter: z.string(),
  totalPrice: z.string(),
  odometer: z.coerce.number().nullable().optional(),
});

export const insertRefrigerationSchema = z.object({
  vehicleId: z.coerce.number(),
  date: z.coerce.date(),
  type: z.string(),
  quantity: z.string(),
  cost: z.string(),
});

export const insertSupplierSchema = z.object({
  name: z.string(),
  cnpj: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
});

export const insertCompanySchema = z.object({
  name: z.string(),
  cnpj: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type InsertRefueling = z.infer<typeof insertRefuelingSchema>;
export type InsertRefrigeration = z.infer<typeof insertRefrigerationSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Refueling = typeof refuelings.$inferSelect;
export type Refrigeration = typeof refrigeration.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Company = typeof companies.$inferSelect;
