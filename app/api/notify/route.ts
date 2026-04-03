import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const { data, error } = await supabase
      .from('emails')
      .insert([{ email }]);

    if (error) {
      console.log(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: 'Error al guardar correo' }, { status: 500 });
  }
}