import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.name.split('.').pop();
        const filename = `${Date.now()}.${ext}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);

        await writeFile(uploadPath, buffer);
        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch {
        return NextResponse.json({ error: 'Yükleme başarısız.' }, { status: 500 });
    }
}
