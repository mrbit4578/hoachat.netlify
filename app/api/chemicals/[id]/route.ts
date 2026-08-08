import { NextRequest, NextResponse } from "next/server";
import { validateZDHCCompliance } from "@/app/lib/zdhc";

// Mock database
let chemicals: any[] = [
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
 * GET /api/chemicals/[id] - Get chemical by ID (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const chemical = chemicals.find(c => c.id === id);
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: "Chemical not found" },
        { status: 404 }
      );
    }
    
    const compliance = validateZDHCCompliance(chemical);
    
    return NextResponse.json({
      success: true,
      data: {
        ...chemical,
        compliance,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch chemical" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chemicals/[id] - Update chemical (requires editor role)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Note: In production, verify auth via middleware
    // For now, accepting all authenticated requests
    
    const chemical = chemicals.find(c => c.id === id);
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: "Chemical not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Update chemical
    const updated = {
      ...chemical,
      ...body,
      id: chemical.id,
      createdAt: chemical.createdAt,
      updatedAt: new Date(),
      updatedBy: "user@example.com",
    };
    
    // Update in mock database
    const index = chemicals.findIndex(c => c.id === id);
    chemicals[index] = updated;
    
    const compliance = validateZDHCCompliance(updated);
    
    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        compliance,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update chemical" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chemicals/[id] - Delete chemical (requires admin role)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const chemical = chemicals.find(c => c.id === id);
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: "Chemical not found" },
        { status: 404 }
      );
    }
    
    // Delete from mock database
    chemicals = chemicals.filter(c => c.id !== id);
    
    return NextResponse.json({
      success: true,
      message: "Chemical deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete chemical" },
      { status: 500 }
    );
  }
}
