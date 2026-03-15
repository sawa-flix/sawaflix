import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const id = params.id

    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 })

    const supabase = await createClient()
    const { data, error } = await supabase
        .from(category)
        .select('*')
        .eq('id', id)
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json(data)
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()
    const body = await request.json()
    const { category, ...updateData } = body
    const id = params.id

    if (!category) return NextResponse.json({ error: "Category required" }, { status: 400 })

    const { data, error } = await supabase
        .from(category)
        .update(updateData)
        .eq('id', id)
        .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const id = params.id

    const supabase = await createClient()
    const { error } = await supabase
        .from(category!)
        .delete()
        .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
}