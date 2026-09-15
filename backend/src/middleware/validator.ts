import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "./errorHandler.js";

export type ValidationRule<T = any> = (val: T, field: string) => string | null;

export const Rules = {
  required: (val: any, field: string) => {
    if (val === undefined || val === null || val === "") {
      return `${field} is required`;
    }
    return null;
  },

  isString: (val: any, field: string) => {
    if (val !== undefined && val !== null && typeof val !== "string") {
      return `${field} must be a string`;
    }
    return null;
  },

  isNumber: (val: any, field: string) => {
    if (val !== undefined && val !== null && (typeof val !== "number" || isNaN(val))) {
      return `${field} must be a valid number`;
    }
    return null;
  },

  isBoolean: (val: any, field: string) => {
    if (val !== undefined && val !== null && typeof val !== "boolean") {
      return `${field} must be a boolean`;
    }
    return null;
  },

  isEmail: (val: any, field: string) => {
    if (val && typeof val === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return `${field} must be a valid email address`;
      }
    }
    return null;
  },

  isHex: (val: any, field: string) => {
    if (val && typeof val === "string") {
      if (!/^0x[0-9a-fA-F]+$/.test(val) && !/^[0-9a-fA-F]+$/.test(val)) {
        return `${field} must be a valid hex string`;
      }
    }
    return null;
  },

  minLength: (min: number) => (val: any, field: string) => {
    if (val && typeof val === "string" && val.length < min) {
      return `${field} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max: number) => (val: any, field: string) => {
    if (val && typeof val === "string" && val.length > max) {
      return `${field} must not exceed ${max} characters`;
    }
    return null;
  },
};

export type SchemaDefinition = Record<string, ValidationRule[]>;

export function validateBody(schema: SchemaDefinition) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: Array<{ name: string; reason: string }> = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body?.[field];
      for (const rule of rules) {
        const errorMsg = rule(value, field);
        if (errorMsg) {
          errors.push({ name: field, reason: errorMsg });
          break; // Stop at first error for this field
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError("Request payload validation failed", errors));
    }

    next();
  };
}
