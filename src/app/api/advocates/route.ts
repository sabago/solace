import { NextRequest } from 'next/server';
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import type { Advocate, AdvocateResponse } from '@/types/advocate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    let finalData: Advocate[] = advocateData;
    
    try {
      const dbData = await db.select().from(advocates);
      
      if (dbData.length > 0) {
        const transformedDbData: Advocate[] = dbData.map(advocate => ({
          ...advocate,
          specialties: advocate.specialties as string[],
          createdAt: advocate.createdAt?.toISOString()
        }));
        finalData = transformedDbData;
      }
    } catch (dbError) {
      console.warn('Database connection failed, using static data:', dbError);
      finalData = advocateData;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      finalData = finalData.filter(advocate => {
        return (
          advocate.firstName.toLowerCase().includes(searchLower) ||
          advocate.lastName.toLowerCase().includes(searchLower) ||
          advocate.city.toLowerCase().includes(searchLower) ||
          advocate.degree.toLowerCase().includes(searchLower) ||
          advocate.specialties.some((s: string) => s.toLowerCase().includes(searchLower))
        );
      });
    }

    const total = finalData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = finalData.slice(offset, offset + limit);

    const response: AdvocateResponse = {
      data: paginatedData,
      total,
      page,
      totalPages,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching advocates:', error);
    return Response.json(
      { error: 'Failed to fetch advocates' },
      { status: 500 }
    );
  }
}
