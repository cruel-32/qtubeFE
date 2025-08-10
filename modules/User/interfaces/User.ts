import { Platform } from '@/types/Platform'
import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  nickName: z.string().min(1, '닉네임은 필수입니다'),
  picture: z.string().optional(),
  platform: z.nativeEnum(Platform),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  profile: z.string().optional(),
  introduction: z.string().optional(),
  profileImage: z.string().optional(),
})

export const UpdateUserSchema = CreateUserSchema.partial()

export const FindOrCreateUserSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  name: z.string().min(1, '이름은 필수입니다'),
  nickName: z.string().min(1, '닉네임은 필수입니다'),
  picture: z.string().optional(),
  platform: z.nativeEnum(Platform),
  profile: z.string().optional(),
  introduction: z.string().optional(),
  profileImage: z.string().optional(),  
})

export const UserParamsSchema = z.object({
  id: z.string(),
})

export const EmailParamsSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
})

export const PlatformParamsSchema = z.object({
  platform: z.nativeEnum(Platform),
})

export const UserDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  nickName: z.string(),
  picture: z.string().optional(),
  platform: z.nativeEnum(Platform),
  email: z.string().email(),
  profile: z.string().optional(),
  introduction: z.string().optional(),
  profileImage: z.string().optional(),
  fcmToken: z.string().optional(),
  pushNotificationsEnabled: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type CreateUserRequest = z.infer<typeof CreateUserSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
export type FindOrCreateUserRequest = z.infer<typeof FindOrCreateUserSchema>
export type UserParams = z.infer<typeof UserParamsSchema>
export type EmailParams = z.infer<typeof EmailParamsSchema>
export type PlatformParams = z.infer<typeof PlatformParamsSchema>
export type UserDetails = z.infer<typeof UserDetailsSchema>

export const GoogleLoginSchema = z.object({
  idToken: z.string().min(1, 'ID 토큰은 필수입니다.'),
});

export type GoogleLoginRequest = z.infer<typeof GoogleLoginSchema>;