import Zod from 'zod';

export const signUpvalidationSchema = Zod.object({
  username: Zod.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters'),
  email: Zod.string()
    .email('Invalid email format')
    .max(50, 'Email cannot exceed 50 characters'),
  password: Zod.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  fullName: Zod.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
});

export const loginValidationSchema = Zod.object({
  username: Zod.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters'),
  email: Zod.string()
    .email('Invalid email format')
    .max(50, 'Email cannot exceed 50 characters'),
  password: Zod.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

export const passwordValidationSchema = Zod.object({
  oldPassword: Zod.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  newPassword: Zod.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});
