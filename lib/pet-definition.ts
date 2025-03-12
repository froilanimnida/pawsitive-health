import { z } from 'zod'
import { Breeds } from './types/breed-types'

const breedsStringArray: string[] = []

for (const breed in Breeds) {
    breedsStringArray.push(breed)
}

export const PetSchema = z.object({
    name: z.string().min(1).max(50),
    species: z.enum(['male', 'female', 'prefer-not-to-say']),
    breed: z.string(),
    weight: z.number(),
    "medical-history": z.string(),
    "vaccination-status": z.string()
})