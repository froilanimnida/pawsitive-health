import React from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import  type { Metadata } from 'next'
import ResponsiveContainer from '@/components/shared/layout/responsive-container'
import MedicineForm from '@/components/form/medicine-form'

export const metadata: Metadata = {
  title: "Pawsitive | Create new Medicine",
  description: "Create a new medicine",
}

function AddMedicine() {
  return (
    <ResponsiveContainer className='flex justify-center items-center'>
			<Card>
				<CardHeader>
					<CardTitle>
            Create new Medicine
          </CardTitle>
					<CardDescription>
            Create a new medicine that will be available across the system for prescription
          </CardDescription>
				</CardHeader>
				<CardContent>
					<MedicineForm />
				</CardContent>
			</Card>
		</ResponsiveContainer>
  )
}

export default AddMedicine