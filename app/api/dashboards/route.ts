import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET - List all dashboards or get specific dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific dashboard
      const { data, error } = await supabaseAdmin
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, dashboard: data });
    } else {
      // List all dashboards
      const { data, error } = await supabaseAdmin
        .from('dashboards')
        .select('id, name, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ success: true, dashboards: data });
    }
  } catch (error: any) {
    console.error("Error fetching dashboards:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new dashboard
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, snapshot } = body;

    if (!name || !snapshot) {
      return NextResponse.json(
        { success: false, error: "Name and snapshot are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('dashboards')
      .insert({
        name,
        snapshot,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      dashboard: data,
      message: `Dashboard "${name}" created`
    });
  } catch (error: any) {
    console.error("Error creating dashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update existing dashboard (save/rename)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, snapshot } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Dashboard ID is required" },
        { status: 400 }
      );
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (snapshot !== undefined) updates.snapshot = snapshot;

    const { data, error } = await supabaseAdmin
      .from('dashboards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      dashboard: data,
      message: "Dashboard updated"
    });
  } catch (error: any) {
    console.error("Error updating dashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete dashboard
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Dashboard ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('dashboards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Dashboard deleted"
    });
  } catch (error: any) {
    console.error("Error deleting dashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
