import { NextRequest, NextResponse } from "next/server";
import { validateZDHCCompliance } from "@/app/lib/zdhc";

// Mock database - in production, use Supabase
const chemicals: any[] = [
  {
    id: "1",
    productName: "Eco-Friendly Dye",
    productCode: "EFD-001",
    manufacturer: "Eco Chemical Ltd",
    zdhcCertified: true,
    zdhcLevel: "ZDHC Approved",
    chemicalComposition: [
      { componentName: "Water", casNumber: "7732-18-5", percentage: 50 },
      { componentName: "Natural Dye Extract", casNumber: "9004-96-0", percentage: 30 },
      { componentName: "Sodium Hydroxide", casNumber: "1310-73-2", percentage: 20 },
    ],
    hazardousSubstances: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-08-01"),
    createdBy: "admin@example.com",
  },
];

/**
 * GET /api/chemicals - List all chemicals (public)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase();
    const certified = searchParams.get("certified");
    
    let filtered = chemicals;
    
    if (search) {
      filtered = filtered.filter(c =>
        c.productName.toLowerCase().includes(search) ||
        c.productCode.toLowerCase().includes(search)
      );
    }
    
    if (certified === "true") {
      filtered = filtered.filter(c => c.zdhcCertified);
    } else if (certified === "false") {
      filtered = filtered.filter(c => !c.zdhcCertified);
    }
    
    // Add compliance status
    const withCompliance = filtered.map(c => ({
      ...c,
      compliance: validateZDHCCompliance(c),
    }));
    
    return NextResponse.json({
      success: true,
      data: withCompliance,
      total: withCompliance.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch chemicals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chemicals - Create new chemical (requires editor role)
 */
export async function POST(request: NextRequest) {
  try {
    // Note: For authentication in API routes, use middleware or headers
    // NextAuth v5 requires middleware setup for server-side auth
    
    const body = await request.json();
    
    // Validate required fields
    const required = ["productName", "productCode", "manufacturer", "chemicalComposition"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create new chemical
    const newChemical = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "user@example.com",
      zdhcCertified: body.zdhcCertified || false,
      hazardousSubstances: body.hazardousSubstances || [],
    };
    
    // Validate compliance
    const compliance = validateZDHCCompliance(newChemical);
    
    chemicals.push(newChemical);
    
    return NextResponse.json({
      success: true,
      data: {
        ...newChemical,
        compliance,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating chemical:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create chemical" },
      { status: 500 }
    );
  }
}
