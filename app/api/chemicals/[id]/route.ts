import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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
  { params }: { params: { id: string } }
) {
  try {
    const chemical = chemicals.find(c => c.id === params.id);
    
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check authorization
    if (session.user.role === "viewer") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only editors can update chemicals" },
        { status: 403 }
      );
    }
    
    const chemical = chemicals.find(c => c.id === params.id);
    
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
      id: chemical.id, // Don't allow changing ID
      createdAt: chemical.createdAt, // Don't allow changing creation date
      updatedAt: new Date(),
      updatedBy: session.user.email,
    };
    
    // Update in mock database
    const index = chemicals.findIndex(c => c.id === params.id);
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check authorization (admin only)
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only admins can delete chemicals" },
        { status: 403 }
      );
    }
    
    const chemical = chemicals.find(c => c.id === params.id);
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: "Chemical not found" },
        { status: 404 }
      );
    }
    
    // Delete from mock database
    chemicals = chemicals.filter(c => c.id !== params.id);
    
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
